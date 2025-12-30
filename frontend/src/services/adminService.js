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
        // const t = await res.json()
        // console.log(t);
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
        const res = await fetch(`${API_BASE_URL}/users/bulk-json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ users: usersData }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to bulk create users");
        }
        return res.json();
    },

    async bulkValidateUsers(usersData) {
        const res = await fetch(`${API_BASE_URL}/users/bulk-validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ users: usersData }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to validate users");
        }
        return res.json();
    },

    async createDepartment(dept_name) {
        const res = await fetch(`${API_BASE_URL}/departments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ dept_name }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create department");
        }
        return res.json();
    },

    async createDesignation(desg_name) {
        const res = await fetch(`${API_BASE_URL}/designations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ desg_name }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create designation");
        }
        return res.json();
    },

    async getDesignations() {
        const res = await fetch(`${API_BASE_URL}/designations`, { credentials: "include" });
        return res.json();
    },
    async getShifts() {
        const res = await fetch(`${API_BASE_URL}/shifts`, { credentials: "include" });
        return res.json();
    },
    async getWorkLocations() {
        const res = await fetch(`/api/locations`, { credentials: "include" });
        return res.json();
    }
};
