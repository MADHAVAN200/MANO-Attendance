const API_BASE_URL = "/api/attendance";

export const attendanceService = {
    // Check In
    async timeIn(data) {
        const formData = new FormData();
        formData.append("latitude", data.latitude);
        formData.append("longitude", data.longitude);
        if (data.imageFile) {
            formData.append("image", data.imageFile);
        }
        if (data.late_reason) {
            formData.append("late_reason", data.late_reason);
        }

        const res = await fetch(`${API_BASE_URL}/timein`, {
            method: "POST",
            body: formData, // Content-Type header excluded so browser sets it with boundary
            credentials: "include",
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to check in");
        }
        return res.json();
    },

    // Check Out
    async timeOut(data) {
        const formData = new FormData();
        formData.append("latitude", data.latitude);
        formData.append("longitude", data.longitude);
        if (data.imageFile) {
            formData.append("image", data.imageFile);
        }

        const res = await fetch(`${API_BASE_URL}/timeout`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to check out");
        }
        return res.json();
    },

    // Get Records for a user
    async getMyRecords(dateFrom, dateTo) {
        let url = `${API_BASE_URL}/records?limit=50`;
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;

        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to fetch records");
        }
        return res.json();
    },


    // Get Real-time Attendance (Admin)
    async getRealTimeAttendance(date) {
        // Defaults to today if no date provided
        const targetDate = date || new Date().toISOString().split('T')[0];
        let url = `${API_BASE_URL}/records/admin?date_from=${targetDate}&date_to=${targetDate}&limit=200`;

        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to fetch live attendance");
        }
        // console.log(res);
        return res.json();
    }
};
