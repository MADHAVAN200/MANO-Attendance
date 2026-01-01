import api from './api';

const employeeService = {
    /**
     * Fetch the assigned work locations for the logged-in employee.
     * Returns { ok: boolean, locations: [], unrestricted: boolean }
     */
    getMyLocations: async () => {
        try {
            const response = await api.get('/employee/locations');
            return response.data;
        } catch (error) {
            console.error("Error fetching employee locations:", error);
            throw error;
        }
    }
};

export default employeeService;
