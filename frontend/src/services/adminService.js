const API_BASE_URL = "/api/admin";

export const adminService = {
    // Get all users
    async getAllUsers(includeWorkLocation = false) {
        const res = await fetch(`${API_BASE_URL}/users?workLocation=${includeWorkLocation}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to fetch users");
        }
        return res.json();
    },

    // Get single user
    async getUserById(userId) {
        const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to fetch user");
        }
        return res.json();
    },

    // Create user
    async createUser(userData) {
        const res = await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userData),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create user");
        }
        return res.json();
    },

    // Update user
    async updateUser(userId, userData) {
        const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userData),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update user");
        }
        return res.json();
    },

    // Delete user
    async deleteUser(userId) {
        const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to delete user");
        }
        return res.json();
    },

    // Helpers
    async getDepartments() {
        const res = await fetch(`${API_BASE_URL}/departments`, { credentials: "include" });
        return res.json();
    },
    async bulkCreateUsersJson(usersData) {
        const response = await axios.post(`${API_BASE_URL}/users/bulk-json`, { users: usersData });
        return response.data;
    },

    async bulkValidateUsers(usersData) {
        const response = await axios.post(`${API_BASE_URL}/users/bulk-validate`, { users: usersData });
        return response.data;
    },

    async getDesignations() {
        const res = await fetch(`${API_BASE_URL}/designations`, { credentials: "include" });
        return res.json();
    },
    async getShifts() {
        const res = await fetch(`${API_BASE_URL}/shifts`, { credentials: "include" });
        return res.json();
    }
};
