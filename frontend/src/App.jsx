import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import AdminDashboard from "./pages/dashboard/AdminDashboard"
import Attendance from "./pages/attendance/Attendance"
import EmployeeList from "./pages/employees/EmployeeList"
import EmployeeForm from "./pages/employees/EmployeeForm"
import BulkUpload from "./pages/employees/BulkUpload"
import AttendanceMonitoring from "./pages/attendance-monitoring/AttendanceMonitoring"
import Reports from "./pages/reports/Reports"
import HolidayManagement from "./pages/holidays/HolidayManagement"
import PolicyBuilder from "./pages/policy-builder/PolicyBuilder"
import GeoFencing from "./pages/geofencing/GeoFencing"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance-monitoring" element={<AttendanceMonitoring />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/holidays" element={<HolidayManagement />} />
        <Route path="/policy-builder" element={<PolicyBuilder />} />
        <Route path="/geofencing" element={<GeoFencing />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/add" element={<EmployeeForm />} />
        <Route path="/employees/edit/:id" element={<EmployeeForm />} />
        <Route path="/employees/bulk" element={<BulkUpload />} />
      </Routes>

    </>
  )
}

export default App
