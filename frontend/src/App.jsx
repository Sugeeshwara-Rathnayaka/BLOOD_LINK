import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import RoleSelection from "./pages/RoleSelection.jsx";
import Register from "./pages/Register.jsx";
import BloodBankDashboard from "./pages/BloodBankDashboard.jsx";
import HospitalDashboard from "./pages/HospitalDashboard.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import DonorDashboard from "./pages/DonorDashboard.jsx";
import OrganizationDashboard from "./pages/OrganizationDashboard.jsx";
import RequesterDashboard from "./pages/RequesterDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<RoleSelection mode="login" />} />
      <Route path="/register" element={<RoleSelection mode="register" />} />
      <Route path="/login/:roleId" element={<Login />} />
      <Route path="/register/:roleId" element={<Register />} />

      {/* Secret Internal Route */}
      <Route path="/staff-portal-secure" element={<AdminLogin />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Super Admin Routes */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Blood Bank Routes */}
          <Route
            path="/bloodbank/dashboard"
            element={
              <ProtectedRoute allowedRoles={["BloodBankAdmin", "SuperAdmin"]}>
                <BloodBankDashboard />
              </ProtectedRoute>
            }
          />

          {/* Hospital Routes */}
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Hospital"]}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />

          {/* Donor Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Donor"]}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Organization Routes */}
          <Route
            path="/organization/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Organization"]}>
                <OrganizationDashboard />
              </ProtectedRoute>
            }
          />

          {/* Requester Routes */}
          <Route
            path="/requester/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Requester"]}>
                <RequesterDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* Catch-All Route for 404s */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
