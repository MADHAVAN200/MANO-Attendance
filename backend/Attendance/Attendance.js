import express from "express";
import { knexDB } from "../database.js";
import { authenticateJWT } from "../AuthAPI/LoginAPI.js";
import { fetchTimeStamp, coordsToAddress } from "../Google_API/Maps.js";
import multer from "multer";
import { uploadFile, getFileUrl, listFiles, uploadCompressedImage } from "../s3/s3Service.js";
import EventBus from "../utils/EventBus.js";
import { getEventSource } from "../utils/clientInfo.js";
import catchAsync from "../utils/catchAsync.js";
import { PolicyService } from "./PolicyEngine.js";
import { verifyUserGeofence } from "./Geofencing.js";

const router = express.Router();
const upload = multer(); // store files in memory

// Helper: Fetch User Shift
async function getUserShift(user_id) {
  const user = await knexDB("users")
    .join("shifts", "users.shift_id", "shifts.shift_id")
    .where("users.user_id", user_id)
    .select("shifts.*")
    .first();
  return user;
}

// POST /attendance/checkin
router.post("/timein", authenticateJWT, upload.single("image"),
  catchAsync(async (req, res) => {

    // fields come as strings in multipart
    const user_id = req.user.user_id;
    const org_id = req.user.org_id;
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const accuracy = Number(req.body.accuracy);
    const late_reason = req.body.late_reason || null;
    const file = req.file; // may be undefined if no image sent

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid or missing latitude/longitude",
      });
    }

    // ACCURACY VALIDATION - Security: Prevent fake locations
    const MAX_ALLOWED_ACCURACY = 200; // meters
    if (!accuracy || accuracy > MAX_ALLOWED_ACCURACY) {
      return res.status(400).json({
        ok: false,
        message: `Location accuracy too poor (${Math.round(accuracy)}m). GPS/Wi-Fi required (< ${MAX_ALLOWED_ACCURACY}m).`,
      });
    }

    // STEP 1: Convert UTC → local time at user's coordinates
    const nowUTC = new Date().toISOString();
    const tz = await fetchTimeStamp(latitude, longitude, nowUTC);
    const localTime = tz.localTime;

    // STEP 2: Check existing open session
    const openSession = await knexDB("attendance_records")
      .where({ user_id })
      .whereNull("time_out")
      .whereRaw("DATE(time_in) = DATE(?)", [localTime])
      .first();

    if (openSession) {
      return res.status(400).json({
        ok: false,
        message: "Already timed in. Please time out first.",
      });
    }

    // STEP 3: Convert coordinates into address
    const { address } = await coordsToAddress(latitude, longitude);

    // STEP 4: --- BUILD SESSION CONTEXT ---
    const sessionContext = await PolicyService.buildSessionContext(user_id, localTime, "time_in");

    // STEP 5: --- POLICY VALIDATION ---
    const policy = await PolicyService.getPolicy(org_id);

    // STEP 5.1: Check geofence (conditionally based on policy)
    let isInLocation = true;
    const reqs = policy.rules.entry_requirements || {};

    // Only check geofence if it's required for this event
    const shouldCheckGeofence = reqs.geofence === true ||
      (typeof reqs.geofence === 'object' && reqs.geofence.required);

    if (shouldCheckGeofence) {
      isInLocation = await verifyUserGeofence(user_id, latitude, longitude);
    }

    // STEP 5.2: Build complete policy data (merge session context with current data)
    const policyData = {
      ...sessionContext,
      has_image: !!file,
      is_in_location: isInLocation,
    };

    // STEP 5.3: Validate entry requirements (with conditional logic)
    const policyErrors = PolicyService.validateEntryRequirements(policy.rules, policyData);

    if (policyErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Policy Violation: " + policyErrors.join(", "),
      });
    }

    // STEP 6: Late Calculation
    const shift = await getUserShift(user_id);
    let minutesLate = 0;

    if (shift && shift.start_time) {
      // shift.start_time is "HH:MM:SS"
      const [sH, sM] = shift.start_time.split(':').map(Number);
      const localDate = new Date(localTime);
      const shiftStart = new Date(localDate);
      shiftStart.setHours(sH, sM, 0, 0);

      const diffMs = localDate - shiftStart;
      if (diffMs > 0) {
        minutesLate = Math.floor(diffMs / 60000);
      }
    }

    // STEP 7: Prepare metadata for logging (include session context)
    const metadata = {
      time_in: {
        accuracy: Math.round(accuracy),
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        timestamp_utc: nowUTC,
        timezone: tz.tzName
      },
      session_context: sessionContext
    };

    // STEP 8: Insert attendance with Policy Data & Metadata
    const [attendance_id] = await knexDB("attendance_records").insert({
      user_id,
      org_id: req.user.org_id,
      late_reason: late_reason || (minutesLate > 0 ? "Late Entry" : null),
      late_minutes: minutesLate,
      status: "PRESENT", // Default, updated on checkout
      time_in: localTime,
      time_in_lat: latitude,
      time_in_lng: longitude,
      time_in_address: address,
      metadata: JSON.stringify(metadata),
      created_at: knexDB.fn.now(),
      updated_at: knexDB.fn.now(),
    });

    let imageKey = null;

    // STEP 9: If image present, upload to S3
    if (file) {
      const uploadResult = await uploadCompressedImage({
        fileBuffer: file.buffer,
        key: `${attendance_id}_in`,
        directory: "attendance_images"
      });

      imageKey = uploadResult.key;

      await knexDB("attendance_records")
        .where({ attendance_id })
        .update({
          time_in_image_key: imageKey,
          updated_at: knexDB.fn.now(),
        });
    }

    EventBus.emitNotification({
      org_id: req.user.org_id,
      user_id: user_id,
      title: "Attendance Checked In",
      message: `You have successfully checked in at ${localTime} from ${address}`,
      type: "SUCCESS",
      related_entity_type: "ATTENDANCE",
      related_entity_id: attendance_id
    });

    EventBus.emitActivityLog({
      user_id,
      org_id: req.user.org_id,
      event_type: "CHECK_IN",
      event_source: getEventSource(req),
      object_type: "ATTENDANCE",
      object_id: attendance_id,
      description: `User checked in at ${address} (Session #${sessionContext.session_number})`,
      location: `${latitude},${longitude}`,
      request_ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.json({
      ok: true,
      attendance_id,
      local_time: localTime,
      address: address,
      tz_name: tz.tzName,
      image_key: imageKey,
      session_number: sessionContext.session_number,
      is_first_session: sessionContext.is_first_session,
      message: "Timed in successfully",
    });
  })
);

// POST /attendance/checkout
router.post("/timeout", authenticateJWT, upload.single("image"),
  catchAsync(async (req, res) => {

    // fields come as strings in multipart
    const user_id = req.user.user_id;
    const org_id = req.user.org_id;
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const accuracy = Number(req.body.accuracy);
    const file = req.file;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid or missing latitude/longitude" });
    }

    // ACCURACY VALIDATION - Security: Prevent fake locations
    const MAX_ALLOWED_ACCURACY = 200; // meters
    if (!accuracy || accuracy > MAX_ALLOWED_ACCURACY) {
      return res.status(400).json({
        ok: false,
        message: `Location accuracy too poor (${Math.round(accuracy)}m). GPS/Wi-Fi required (< ${MAX_ALLOWED_ACCURACY}m).`,
      });
    }

    // STEP 1: Get current UTC time and convert to LOCAL
    const nowUTC = new Date().toISOString();
    const tz = await fetchTimeStamp(latitude, longitude, nowUTC);
    const localTime = tz.localTime;

    // STEP 2: Convert coordinates into address
    const { address } = await coordsToAddress(latitude, longitude);

    // STEP 3: Find open attendance session
    const openSession = await knexDB("attendance_records")
      .where({ user_id })
      .whereNull("time_out")
      .whereRaw("DATE(time_in) = DATE(?)", [localTime])
      .first();

    if (!openSession) {
      return res.status(400).json({
        ok: false,
        message: "No active time-in found to time out.",
      });
    }

    // STEP 4: --- BUILD SESSION CONTEXT ---
    const sessionContext = await PolicyService.buildSessionContext(user_id, localTime, "time_out");

    // STEP 5: --- POLICY VALIDATION ---
    const policy = await PolicyService.getPolicy(org_id);

    // STEP 5.1: Check geofence (conditionally based on policy)
    let isInLocation = true;
    const reqs = policy.rules.entry_requirements || {};

    // Only check geofence if it's required for this event
    const shouldCheckGeofence = reqs.geofence === true ||
      (typeof reqs.geofence === 'object' && reqs.geofence.required);

    if (shouldCheckGeofence) {
      isInLocation = await verifyUserGeofence(user_id, latitude, longitude);
    }

    // STEP 5.2: Build complete policy data (merge session context with current data)
    const policyData = {
      ...sessionContext,
      has_image: !!file,
      is_in_location: isInLocation,
    };

    // STEP 5.3: Validate entry requirements (with conditional logic)
    const policyErrors = PolicyService.validateEntryRequirements(policy.rules, policyData);

    if (policyErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Policy Violation: " + policyErrors.join(", "),
      });
    }

    let imageKey = null;

    // STEP 6: If image present, upload to S3
    if (file) {
      const uploadResult = await uploadCompressedImage({
        fileBuffer: file.buffer,
        key: `${openSession.attendance_id}_out`,
        directory: "attendance_images"
      });

      imageKey = uploadResult.key;

      await knexDB("attendance_records")
        .where({ attendance_id: openSession.attendance_id })
        .update({
          time_out_image_key: imageKey,
          updated_at: knexDB.fn.now(),
        });
    }

    // STEP 7: Calculate Duration for this session
    const timeIn = new Date(openSession.time_in);
    const timeOut = new Date(localTime);
    const durationMs = timeOut - timeIn;
    const totalHours = durationMs / (1000 * 60 * 60);

    const minutesLate = openSession.late_minutes || 0;

    // STEP 8: Build enhanced policy data for status evaluation
    // Include both session-specific and day-level data
    const statusEvalData = {
      ...policyData,
      // Session-specific
      total_hours: totalHours,
      minutes_late: minutesLate,
      check_in_hour: timeIn.getHours(),
      check_out_hour: timeOut.getHours(),
      // Update with current checkout time
      last_time_out_hour: timeOut.getHours()
    };

    // STEP 9: Evaluate Status (using enhanced data)
    const status = PolicyService.evaluateStatus(policy.rules, statusEvalData);

    // Merge metadata - Keep time_in data, add time_out data
    let metadata = {};
    try {
      metadata = openSession.metadata ? JSON.parse(openSession.metadata) : {};
    } catch (e) {
      console.error("Failed to parse existing metadata:", e);
    }

    metadata.time_out = {
      accuracy: Math.round(accuracy),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      timestamp_utc: nowUTC,
      timezone: tz.tzName,
      total_hours: parseFloat(totalHours.toFixed(2))
    };

    // Add session context to metadata
    metadata.session_context_at_checkout = sessionContext;

    await knexDB("attendance_records")
      .where({ attendance_id: openSession.attendance_id })
      .update({
        time_out: localTime,
        time_out_lat: latitude,
        time_out_lng: longitude,
        time_out_address: address,
        status: status,
        overtime_hours: totalHours > 8 ? (totalHours - 8) : 0, // Simple calc for now
        metadata: JSON.stringify(metadata),
        updated_at: knexDB.fn.now(),
      });

    EventBus.emitNotification({
      org_id: req.user.org_id,
      user_id: user_id,
      title: "Attendance Checked Out",
      message: `You have successfully checked out at ${localTime}. Total hours today: ${sessionContext.total_hours_today.toFixed(2)}h`,
      type: "INFO",
      related_entity_type: "ATTENDANCE",
      related_entity_id: openSession.attendance_id
    });

    EventBus.emitActivityLog({
      user_id,
      org_id: req.user.org_id,
      event_type: "CHECK_OUT",
      event_source: getEventSource(req),
      object_type: "ATTENDANCE",
      object_id: openSession.attendance_id,
      description: `User checked out at ${address} (Status: ${status})`,
      location: `${latitude},${longitude}`,
      request_ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.json({
      ok: true,
      attendance_id: openSession.attendance_id,
      local_time_out: localTime,
      address: address,
      tz_name: tz.tzName,
      image_key: imageKey,
      status: status,
      session_hours: parseFloat(totalHours.toFixed(2)),
      total_hours_today: sessionContext.total_hours_today,
      message: "Timed out successfully",
    });
  })
);

// Admin attendance records and images with admin role check
router.get("/records/admin", authenticateJWT, catchAsync(async (req, res) => {
  // try removed
  if (req.user.user_type !== "admin" && req.user.user_type !== "HR") {
    return res.status(403).json({ ok: false, message: "Access denied" });
  }

  const { user_id, date_from, date_to, limit = 50 } = req.query;

  let query = knexDB("attendance_records")
    .join("users", "attendance_records.user_id", "users.user_id")
    .leftJoin("designations", "users.desg_id", "designations.desg_id")
    .select(
      "attendance_records.*",
      knexDB.raw("DATE_FORMAT(attendance_records.time_in, '%Y-%m-%d %H:%i:%s') as time_in"),
      knexDB.raw("DATE_FORMAT(attendance_records.time_out, '%Y-%m-%d %H:%i:%s') as time_out"),
      knexDB.raw("DATE_FORMAT(attendance_records.created_at, '%Y-%m-%d %H:%i:%s') as created_at"),
      knexDB.raw("DATE_FORMAT(attendance_records.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at"),
      "users.user_name",
      "users.email",
      "designations.desg_name as designation"
    )
    .orderBy("time_in", "desc")
    .limit(Math.min(parseInt(limit), 100));

  if (user_id) query = query.where("attendance_records.user_id", user_id);
  query = query.where("attendance_records.org_id", req.user.org_id);
  if (date_from) query = query.whereRaw("DATE(time_in) >= DATE(?)", [date_from]);
  if (date_to) query = query.whereRaw("DATE(time_in) <= DATE(?)", [date_to]);

  const records = await query;

  const withUrls = await Promise.all(
    records.map(async (row) => {
      let timeInUrl = null;
      let timeOutUrl = null;

      if (row.time_in_image_key) {
        const { url } = await getFileUrl({ key: row.time_in_image_key });
        timeInUrl = url;
      }
      if (row.time_in_image_key) {
        const { url } = await getFileUrl({ key: row.time_out_image_key });
        timeOutUrl = url;
      }

      const time_in = row.time_in == null ? null : String(row.time_in);
      const time_out = row.time_out == null ? null : String(row.time_out);
      const created_at = row.created_at == null ? null : String(row.created_at);
      const updated_at = row.updated_at == null ? null : String(row.updated_at);

      return {
        ...row,
        time_in,
        time_out,
        created_at,
        updated_at,
        time_in_image: timeInUrl,
        time_out_image: timeOutUrl,
      };
    })
  );

  res.json({ ok: true, data: withUrls });
}));

// Normal user fetch their own records with optional limit and date filter
router.get("/records", authenticateJWT, catchAsync(async (req, res) => {
  // try removed
  const userId = req.user.user_id;
  const { date_from, date_to, limit = 50 } = req.query;

  let query = knexDB("attendance_records")
    .where("user_id", userId)
    .orderBy("time_in", "desc")
    .limit(Math.min(parseInt(limit), 100)); // max limit 100

  if (date_from) {
    query = query.whereRaw("DATE(time_in) >= DATE(?)", [date_from]);
  }
  if (date_to) {
    query = query.whereRaw("DATE(time_in) <= DATE(?)", [date_to]);
  }

  const records = await query;

  const withUrls = await Promise.all(
    (records || []).map(async (row) => {
      let timeInUrl = null;
      let timeOutUrl = null;

      if (row.time_in_image_key) {
        const { url } = await getFileUrl({ key: row.time_in_image_key });
        timeInUrl = url;
      }
      if (row.time_out_image_key) {
        const { url } = await getFileUrl({ key: row.time_out_image_key });
        timeOutUrl = url;
      }

      const time_in = row.time_in == null ? null : String(row.time_in);
      const time_out = row.time_out == null ? null : String(row.time_out);
      const created_at = row.created_at == null ? null : String(row.created_at);
      const updated_at = row.updated_at == null ? null : String(row.updated_at);

      return {
        ...row,
        time_in,
        time_out,
        created_at,
        updated_at,
        time_in_image: timeInUrl,
        time_out_image: timeOutUrl,
      };
    })
  );

  res.json({ ok: true, data: withUrls });
}));

router.post("/correction-request", authenticateJWT, async (req, res) => {
  try {
    const {
      attendance_id,
      correction_type,
      request_date,
      requested_time_in,
      requested_time_out,
      location_id,
      reason
    } = req.body;

    const user_id = req.user.user_id;
    const org_id = req.user.org_id;

    if (!correction_type || !request_date || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!attendance_id && !location_id) {
      return res.status(400).json({ error: "Location is required for missed punch requests" });
    }

    const [id] = await knexDB("attendance_correction_requests").insert({
      org_id,
      user_id,
      attendance_id,
      correction_type,
      request_date,
      requested_time_in,
      requested_time_out,
      location_id: location_id || null,
      reason,
      status: "pending",
      audit_trail: JSON.stringify([
        { action: "submitted", by: user_id, at: new Date() }
      ])
    });

    res.status(201).json({
      message: "Correction request submitted",
      acr_id: id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit correction" });
  }
});

router.get("/correction-requests", authenticateJWT, async (req, res) => {
  try {
    const { status, date, month, year, page = 1, limit = 10 } = req.query;
    const org_id = req.user.org_id;
    const user_id = req.user.user_id;
    const user_type = req.user.user_type;

    const offset = (page - 1) * limit;

    const data = await knexDB("attendance_correction_requests as acr")
      .join("users as u", "u.user_id", "acr.user_id")
      .where("acr.org_id", org_id)
      .modify(qb => {
        if (user_type !== "admin") qb.where("acr.user_id", user_id);
        if (status) qb.where("acr.status", status);
        if (date) qb.where("acr.request_date", date);
        if (month) qb.whereRaw('MONTH(acr.request_date) = ?', [month]);
        if (year) qb.whereRaw('YEAR(acr.request_date) = ?', [year]);
      })
      .select(
        "acr.acr_id",
        "acr.attendance_id",
        "acr.correction_type",
        "acr.request_date",
        "acr.status",
        "acr.submitted_at",
        "u.user_id",
        "u.user_name",
        "u.desg_id"
      )
      .orderBy("acr.submitted_at", "desc")
      .limit(limit)
      .offset(offset);

    const countResult = await knexDB("attendance_correction_requests")
      .where("org_id", org_id)
      .modify(qb => {
        if (user_type !== "admin") qb.where("user_id", user_id);
        if (status) qb.where("status", status);
        if (date) qb.where("request_date", date);
        if (month) qb.whereRaw('MONTH(request_date) = ?', [month]);
        if (year) qb.whereRaw('YEAR(request_date) = ?', [year]);
      })
      .count("* as total")
      .first();

    res.json({
      data,
      count: Number(countResult.total)
    });

  } catch (err) {
    console.error("ATTENDANCE CORRECTIONS ERROR →", err);
    res.status(500).json({
      error: "Failed to fetch corrections",
      message: err.message
    });
  }
});

router.get(
  "/correction-request/:acr_id",
  authenticateJWT,
  async (req, res) => {
    try {
      const { acr_id } = req.params;
      const org_id = req.user.org_id;
      const user_id = req.user.user_id;
      const role = req.user.user_type;

      let query = knexDB("attendance_correction_requests as acr")
        .join("users as u", "u.user_id", "acr.user_id")
        .leftJoin("designations as d", "d.desg_id", "u.desg_id")
        .leftJoin("work_locations as wl", "wl.location_id", "acr.location_id")
        .select(
          "acr.acr_id",
          "acr.attendance_id",
          "acr.correction_type",
          "acr.request_date",
          "acr.requested_time_in",
          "acr.requested_time_out",
          "acr.reason",
          "acr.status",
          "acr.reviewed_by",
          "acr.reviewed_at",
          "acr.review_comments",
          "acr.audit_trail",
          "acr.submitted_at",
          "u.user_id",
          "u.user_name",
          "d.desg_name as designation",
          "wl.location_name"
        )
        .where("acr.acr_id", acr_id)
        .andWhere("acr.org_id", org_id);

      // 🔐 Access control
      if (role !== "admin") {
        query.andWhere("acr.user_id", user_id);
      }

      const correction = await query.first();

      if (!correction) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (correction.audit_trail) {
        if (typeof correction.audit_trail === "string") {
          try {
            correction.audit_trail = JSON.parse(correction.audit_trail);
          } catch {
            correction.audit_trail = [];
          }
        }
      } else {
        correction.audit_trail = [];
      }

      res.json(correction);

    } catch (err) {
      console.error("FETCH CORRECTION ERROR →", err);
      res.status(500).json({
        error: "Failed to fetch correction",
        message: err.message
      });
    }
  }
);

router.patch(
  "/correct-request/:acr_id",
  authenticateJWT,
  async (req, res) => {
    try {
      const { acr_id } = req.params;
      const { status, review_comments } = req.body;

      const org_id = req.user.org_id;
      const reviewer_id = req.user.user_id;
      const role = req.user.user_type;

      if (role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const correction = await knexDB("attendance_correction_requests")
        .where({ acr_id, org_id })
        .first();

      if (!correction) {
        return res.status(404).json({ error: "Request not found" });
      }

      let auditTrail = [];

      if (correction.audit_trail) {
        if (typeof correction.audit_trail === "string") {
          try {
            auditTrail = JSON.parse(correction.audit_trail);
          } catch {
            auditTrail = [];
          }
        } else {
          auditTrail = correction.audit_trail;
        }
      }

      auditTrail.push({
        action: status,
        by: reviewer_id,
        at: new Date(),
        comments: review_comments || null
      });

      await knexDB("attendance_correction_requests")
        .where({ acr_id, org_id })
        .update({
          status,
          reviewed_by: reviewer_id,
          reviewed_at: new Date(),
          review_comments: review_comments || null,
          audit_trail: JSON.stringify(auditTrail)
        });

      res.json({
        message: `Request ${status} successfully`
      });

    } catch (err) {
      console.error("UPDATE CORRECTION STATUS ERROR →", err);
      res.status(500).json({
        error: "Failed to update status",
        message: err.message
      });
    }
  }
);

export default router;