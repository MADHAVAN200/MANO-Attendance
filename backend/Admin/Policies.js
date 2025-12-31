import express from 'express';
import { knexDB } from '../database.js';
import { authenticateJWT } from '../AuthAPI/LoginAPI.js';
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

const ensureAdmin = (req, res, next) => {
    if (req.user.user_type === 'admin') {
        return next();
    }
    return res.status(403).json({ ok: false, message: "Access denied. Admins only." });
};

const router = express.Router();

// GET /policies/config
router.get('/config', authenticateJWT, ensureAdmin, catchAsync(async (req, res) => {
    // try removed
    const org_id = req.user.org_id;
    const shifts = await knexDB('shifts').where({ org_id }); // This seems to be fetching shifts, not general config. User might intend to change this later.
    res.json({ ok: true, shifts });
}));

// === SHIFTS ===

// GET /policies/shifts
router.get('/shifts', authenticateJWT, catchAsync(async (req, res) => {
    // try removed
    const org_id = req.user.org_id;
    const shifts = await knexDB('shifts').where({ org_id });
    res.json({ ok: true, shifts });
}));

// POST /policies/shifts
router.post('/shifts', authenticateJWT, catchAsync(async (req, res) => {
    // try removed
    const org_id = req.user.org_id;
    const { shift_name, start_time, end_time, grace_period_mins, is_overtime_enabled, overtime_threshold_hours } = req.body;

    const [id] = await knexDB('shifts').insert({
        org_id,
        shift_name,
        start_time,
        end_time,
        grace_period_mins: grace_period_mins || 0,
        is_overtime_enabled: is_overtime_enabled ? 1 : 0,
        overtime_threshold_hours: overtime_threshold_hours || 8.0
    });

    res.json({ ok: true, message: 'Shift created', shift_id: id });
}));

// PUT /policies/shifts/:shift_id
router.put('/shifts/:shift_id', authenticateJWT, catchAsync(async (req, res) => {
    const org_id = req.user.org_id;
    const { shift_id } = req.params;
    const { shift_name, start_time, end_time, grace_period_mins, is_overtime_enabled, overtime_threshold_hours } = req.body;

    const updates = {
        shift_name,
        start_time,
        end_time,
        grace_period_mins,
        is_overtime_enabled: is_overtime_enabled ? 1 : 0,
        overtime_threshold_hours
    };

    const affected = await knexDB('shifts')
        .where({ shift_id, org_id })
        .update(updates);

    if (affected === 0) {
        return res.status(404).json({ ok: false, message: "Shift not found or unauthorized" });
    }

    res.json({ ok: true, message: 'Shift updated' });
}));

// DELETE /policies/shifts/:shift_id
router.delete('/shifts/:shift_id', authenticateJWT, catchAsync(async (req, res) => {
    const org_id = req.user.org_id;
    const { shift_id } = req.params;

    // Check if shift is assigned to any user
    const usersCount = await knexDB('users').where({ shift_id }).count('user_id as count').first();
    if (usersCount.count > 0) {
        return res.status(400).json({ ok: false, message: `Cannot delete shift. It is assigned to ${usersCount.count} users.` });
    }

    const affected = await knexDB('shifts')
        .where({ shift_id, org_id })
        .del();

    if (affected === 0) {
        return res.status(404).json({ ok: false, message: "Shift not found" });
    }

    res.json({ ok: true, message: 'Shift deleted' });
}));

// === AUTOMATION POLICIES ===

// GET /policies/automation
router.get('/automation', authenticateJWT, catchAsync(async (req, res) => {
    // try removed
    const org_id = req.user.org_id;
    const policies = await knexDB('automation_policies').where({ org_id });
    res.json({ ok: true, policies });
}));

// POST /policies/automation
router.post('/automation', authenticateJWT, catchAsync(async (req, res) => {
    // try removed
    const org_id = req.user.org_id;
    const { policy_name, policy_logic_json } = req.body;

    const [id] = await knexDB('automation_policies').insert({
        org_id,
        policy_name,
        policy_logic_json: JSON.stringify(policy_logic_json || {}),
        is_active: 1
    });

    res.json({ ok: true, message: 'Policy saved', policy_id: id });
}));

export default router;
