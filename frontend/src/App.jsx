import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Public components
import Home from "./pages/Home.jsx";
import RoleSelection from "./pages/RoleSelection.jsx";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));

const ProtectedRoute = lazy(
  () => import("./components/routing/ProtectedRoute.jsx"),
);
const DashboardLayout = lazy(
  () => import("./components/layout/DashboardLayout.jsx"),
);
const BloodBankDashboard = lazy(() => import("./pages/BloodBankDashboard.jsx"));
const HospitalDashboard = lazy(() => import("./pages/HospitalDashboard.jsx"));
const SuperAdminDashboard = lazy(
  () => import("./pages/SuperAdminDashboard.jsx"),
);
const DonorDashboard = lazy(() => import("./pages/DonorDashboard.jsx"));
const OrganizationDashboard = lazy(
  () => import("./pages/OrganizationDashboard.jsx"),
);
const RequesterDashboard = lazy(() => import("./pages/RequesterDashboard.jsx"));

const DashboardLoading = ({ children }) => (
  <Suspense
    fallback={<LoadingSpinner message="Loading your dashboard..." fullScreen />}
  >
    {children}
  </Suspense>
);

export default function App() {
  return (
    <Suspense
      fallback={<LoadingSpinner message="Loading BloodLink..." fullScreen />}
    >
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
                  <DashboardLoading>
                    <SuperAdminDashboard />
                  </DashboardLoading>
                </ProtectedRoute>
              }
            />

            {/* Blood Bank Routes */}
            <Route
              path="/bloodbank/dashboard"
              element={
                <ProtectedRoute allowedRoles={["BloodBankAdmin", "SuperAdmin"]}>
                  <DashboardLoading>
                    <BloodBankDashboard />
                  </DashboardLoading>
                </ProtectedRoute>
              }
            />

            {/* Hospital Routes */}
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Hospital"]}>
                  <DashboardLoading>
                    <HospitalDashboard />
                  </DashboardLoading>
                </ProtectedRoute>
              }
            />

            {/* Donor Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Donor"]}>
                  <DashboardLoading>
                    <DonorDashboard />
                  </DashboardLoading>
                </ProtectedRoute>
              }
            />

            {/* Organization Routes */}
            <Route
              path="/organization/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Organization"]}>
                  <DashboardLoading>
                    <OrganizationDashboard />
                  </DashboardLoading>
                </ProtectedRoute>
              }
            />

            {/* Requester Routes */}
            <Route
              path="/requester/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Requester"]}>
                  <DashboardLoading>
                    <RequesterDashboard />
                  </DashboardLoading>
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Catch-All Route for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
