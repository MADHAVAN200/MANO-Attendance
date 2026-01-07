import { Routes, Route, Outlet } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./context/protection";
import PublicRoute from "./context/publicRoute";
import Login from "./pages/user-auth/Login";
import TestAPI from "./pages/test/TestAPI";

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
import Profile from "./pages/profile/Profile"
import Subscription from "./pages/subscription/Subscription"



function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>

          {/* Public Route: Login */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance-monitoring" element={<AttendanceMonitoring />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/holidays" element={<HolidayManagement />} />
            <Route path="/policy-builder" element={<PolicyBuilder />} />
            <Route path="/geofencing" element={<GeoFencing />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/add" element={<EmployeeForm />} />
              <Route path="/employees/edit/:id" element={<EmployeeForm />} />
              <Route path="/employees/bulk" element={<BulkUpload />} />
            </Route>
          </Route>

          <Route path="/test-api" element={<TestAPI />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
