const API_BASE_URL = "/api/notifications";

export const notificationService = {
    // Get all notifications
    async getAll(limit = 20, unreadOnly = false) {
        const res = await fetch(`${API_BASE_URL}?limit=${limit}&unread_only=${unreadOnly}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to fetch notifications");
        }
        return res.json();
    },

    // Mark single notification as read
    async markAsRead(id) {
        const res = await fetch(`${API_BASE_URL}/${id}/read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to mark notification as read");
        }
        return res.json();
    },

    // Mark all notifications as read
    async markAllAsRead() {
        const res = await fetch(`${API_BASE_URL}/read-all`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to mark all notifications as read");
        }
        return res.json();
    }
};
