const API_BASE_URL = "/api/holiday";

export const holidayService = {
    // Get all holidays
    async getHolidays() {
        const res = await fetch(API_BASE_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to fetch holidays");
        }
        return res.json();
    },

    // Add a new holiday
    async addHoliday(holidayData) {
        const res = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(holidayData),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to add holiday");
        }
        return res.json();
    },

    // Update a holiday
    async updateHoliday(id, holidayData) {
        const res = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(holidayData),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update holiday");
        }
        return res.json();
    },

    // Delete holidays (Supports bulk delete as per backend API)
    async deleteHolidays(ids) {
        const res = await fetch(API_BASE_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ ids }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to delete holiday(s)");
        }
        return res.json();
    }
};
