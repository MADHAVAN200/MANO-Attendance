import api from './api';

const API_BASE_URL = "/holiday";

export const holidayService = {
    // Get all holidays
    async getHolidays() {
        try {
            const res = await api.get(API_BASE_URL);
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch holidays");
        }
    },

    // Add a new holiday
    async addHoliday(holidayData) {
        try {
            const res = await api.post(API_BASE_URL, holidayData);
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to add holiday");
        }
    },

    // Update a holiday
    async updateHoliday(id, holidayData) {
        try {
            const res = await api.put(`${API_BASE_URL}/${id}`, holidayData);
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to update holiday");
        }
    },

    // Delete holidays (Supports bulk delete as per backend API)
    async deleteHolidays(ids) {
        try {
            const res = await api.delete(API_BASE_URL, { data: { ids } });
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to delete holiday(s)");
        }
    }
};
