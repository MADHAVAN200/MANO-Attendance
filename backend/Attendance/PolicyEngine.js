
import { knexDB } from "../database.js";

// --- TEMPLATES ---
// Helpers to generate standard policy JSONs

export const PolicyTemplates = {
    STRICT_SHIFT: ({ selfie = true, geofence = true, grace_mins = 10 } = {}) => ({
        entry_requirements: {
            selfie,
            geofence
        },
        late_rules: { grace_period_mins: grace_mins, require_reason: true },
        status_rules: [
            {
                if: [
                    { ">": [{ var: "minutes_late" }, 120] }, // > 2 hours late
                    "HALF_DAY",
                ],
            },
            {
                if: [
                    { ">": [{ var: "minutes_late" }, grace_mins] },
                    "LATE",
                ],
            },
            {
                if: [
                    { "<": [{ var: "total_hours" }, 4] },
                    "ABSENT",
                ],
            },
        ],
    }),

    // Enhanced Template with Session Context
    FLEXIBLE_SHIFT: () => ({
        entry_requirements: {
            selfie: {
                required: true,
                only_on: ["first_session"]  // Selfie only on first check-in
            },
            geofence: {
                required: true,
                only_on: ["time_in", "first_session"]  // GPS only first check-in
            }
        },
        status_rules: [
            // HALF_DAY if first check-in after 11 AM
            {
                if: [
                    { ">": [{ var: "first_time_in_hour" }, 11] },
                    "HALF_DAY"
                ]
            },
            // HALF_DAY if last check-out before 4 PM
            {
                if: [
                    {
                        "and": [
                            { "!=": [{ var: "last_time_out" }, null] },
                            { "<": [{ var: "last_time_out_hour" }, 16] }
                        ]
                    },
                    "HALF_DAY"
                ]
            },
            // ABSENT if total hours < 4
            {
                if: [
                    { "<": [{ var: "total_hours_today" }, 4] },
                    "ABSENT"
                ]
            },
            // Default: PRESENT
            { if: [true, "PRESENT"] }
        ]
    })
};

// --- CORE ENGINE ---

/**
 * Enhanced Rule Evaluator
 * Supports: >, <, >=, <=, ==, !=, AND, OR, VAR, NOT
 */
function evaluateRule(rule, data) {
    // 1. Literal value
    if (typeof rule !== "object" || rule === null) {
        return rule;
    }

    // 2. Logic Block { "operator": [args...] }
    const keys = Object.keys(rule);
    if (keys.length !== 1) return rule; // Not a rule object

    const op = keys[0];
    const args = rule[op]; // Array of arguments

    // Helper to evaluate args recursively
    const evalArgs = (args) => {
        if (!Array.isArray(args)) return evaluateRule(args, data);
        return args.map((arg) => evaluateRule(arg, data));
    };

    switch (op) {
        case "var":
            return data[args]; // Get variable from data

        // Comparisons
        case ">": {
            const vals = evalArgs(args);
            return vals[0] > vals[1];
        }
        case "<": {
            const vals = evalArgs(args);
            return vals[0] < vals[1];
        }
        case ">=": {
            const vals = evalArgs(args);
            return vals[0] >= vals[1];
        }
        case "<=": {
            const vals = evalArgs(args);
            return vals[0] <= vals[1];
        }
        case "==": {
            const vals = evalArgs(args);
            return vals[0] == vals[1];
        }
        case "!=": {
            const vals = evalArgs(args);
            return vals[0] != vals[1];
        }

        // Logic
        case "and": {
            const vals = evalArgs(args);
            return vals.every((v) => v === true);
        }
        case "or": {
            const vals = evalArgs(args);
            return vals.some((v) => v === true);
        }
        case "not": {
            const val = evaluateRule(args, data);
            return !val;
        }

        // Conditional { "if": [cond, trueVal, falseVal] }
        case "if": {
            const cond = evaluateRule(args[0], data);
            if (cond) return evaluateRule(args[1], data);
            return args[2] ? evaluateRule(args[2], data) : null;
        }

        default:
            return rule;
    }
}

/**
 * Helper: Check if a rule should apply based on conditions
 * @param {Array} conditions - Array of condition strings like ["first_session", "time_in"]
 * @param {Object} reqData - Request data with context
 * @returns {boolean}
 */
function shouldApplyRule(conditions, reqData) {
    if (!conditions || conditions.length === 0) return true;

    return conditions.some(cond => {
        if (cond === "first_session") return reqData.is_first_session === true;
        if (cond === "last_session") return reqData.is_last_session === true;
        if (cond === "time_in") return reqData.event_type === "time_in";
        if (cond === "time_out") return reqData.event_type === "time_out";
        if (cond === "any_session") return true;
        return false;
    });
}

// --- SERVICE METHODS ---

export const PolicyService = {
    /**
     * Get policy for Organization. Returns default if none found.
     */
    getPolicy: async (org_id) => {
        const policy = await knexDB("attendance_policies")
            .where({ org_id, is_active: true })
            .first();

        if (!policy) {
            // Default Fallback
            return {
                rules: PolicyTemplates.STRICT_SHIFT(), // Default strict
                type: "DEFAULT",
            };
        }

        // If string, parse it (Knex sometimes auto-parses JSON cols, but safe to check)
        const rules =
            typeof policy.rules_json === "string"
                ? JSON.parse(policy.rules_json)
                : policy.rules_json;

        return { rules, type: policy.policy_type };
    },

    /**
     * Run status rules against current data
     * Returns: "PRESENT", "HALF_DAY", "ABSENT", "LATE", or null (Normal)
     */
    evaluateStatus: (rules, data) => {
        if (!rules.status_rules) return "PRESENT";

        // Iterate rules, return first non-null match (Priority System)
        for (const ruleWrapper of rules.status_rules) {
            // expect ruleWrapper to be { "if": ... }
            const result = evaluateRule(ruleWrapper, data);
            if (result) return result;
        }

        return "PRESENT"; // Default
    },

    /**
     * Enhanced Entry Requirements Validation
     * Supports conditional requirements (only_on)
     */
    validateEntryRequirements: (rules, reqData) => {
        const errors = [];
        const reqs = rules.entry_requirements || {};

        // Smart Selfie Check
        if (reqs.selfie) {
            let shouldRequire = true;

            // Check if selfie has conditional logic
            if (typeof reqs.selfie === 'object' && !Array.isArray(reqs.selfie)) {
                shouldRequire = reqs.selfie.required && shouldApplyRule(reqs.selfie.only_on, reqData);
            }

            if (shouldRequire && !reqData.has_image) {
                errors.push("Selfie is required for this check-in/out.");
            }
        }

        // Smart Geofence Check
        if (reqs.geofence) {
            let shouldRequire = true;

            // Check if geofence has conditional logic
            if (typeof reqs.geofence === 'object' && !Array.isArray(reqs.geofence)) {
                shouldRequire = reqs.geofence.required && shouldApplyRule(reqs.geofence.only_on, reqData);
            }

            if (shouldRequire && !reqData.is_in_location) {
                errors.push("You are outside the allowed work location.");
            }
        }

        return errors;
    },

    /**
     * Build session context for policy evaluation
     * @param {number} user_id 
     * @param {string} localTime - Current local time
     * @param {string} eventType - "time_in" or "time_out"
     * @returns {Object} Session context data
     */
    buildSessionContext: async (user_id, localTime, eventType) => {
        // Get all today's sessions
        const todaySessions = await knexDB("attendance_records")
            .where({ user_id })
            .whereRaw("DATE(time_in) = DATE(?)", [localTime])
            .orderBy("time_in", "asc");

        const isFirstSession = todaySessions.length === 0;
        const sessionNumber = todaySessions.length + 1;

        // Calculate aggregates
        let totalHoursToday = 0;
        todaySessions.forEach(session => {
            if (session.time_out) {
                const duration = (new Date(session.time_out) - new Date(session.time_in)) / (1000 * 60 * 60);
                totalHoursToday += duration;
            }
        });

        const firstTimeIn = todaySessions[0]?.time_in;
        const lastTimeOut = todaySessions[todaySessions.length - 1]?.time_out;

        // Extract hours from timestamps
        const currentHour = new Date(localTime).getHours();
        const firstTimeInHour = firstTimeIn ? new Date(firstTimeIn).getHours() : null;
        const lastTimeOutHour = lastTimeOut ? new Date(lastTimeOut).getHours() : null;

        return {
            is_first_session: isFirstSession,
            is_last_session: false, // We can't know this until end of day
            session_number: sessionNumber,
            total_sessions: todaySessions.length,

            // Time data
            current_time_hour: currentHour,
            first_time_in: firstTimeIn,
            first_time_in_hour: firstTimeInHour,
            last_time_out: lastTimeOut,
            last_time_out_hour: lastTimeOutHour,

            // Aggregates
            total_hours_today: parseFloat(totalHoursToday.toFixed(2)),
            first_session_late_mins: todaySessions[0]?.late_minutes || 0,

            // Event context
            event_type: eventType
        };
    }
};
