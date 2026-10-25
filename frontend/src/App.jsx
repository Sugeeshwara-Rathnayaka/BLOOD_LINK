import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
// Public components
import Home from "./pages/Home.jsx";
import RoleSelection from "./features/auth/pages/RoleSelection.jsx";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

// Lazy-loaded pages
const Login = lazy(() => import("./features/auth/pages/Login.jsx"));
const Register = lazy(() => import("./features/auth/pages/Register.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));

const ProtectedRoute = lazy(
  () => import("./components/routing/ProtectedRoute.jsx"),
);
const DashboardLayout = lazy(
  () => import("./components/layout/DashboardLayout.jsx"),
);
const BloodBankDashboard = lazy(
  () => import("./features/bloodbank/pages/BloodBankDashboard.jsx"),
);
const HospitalDashboard = lazy(
  () => import("./features/hospital/pages/HospitalDashboard.jsx"),
);
const SuperAdminDashboard = lazy(
  () => import("./features/superadmin/pages/SuperAdminDashboard.jsx"),
);
const DonorDashboard = lazy(
  () => import("./features/donor/pages/DonorDashboard.jsx"),
);
const OrganizationDashboard = lazy(
  () => import("./features/organization/pages/OrganizationDashboard.jsx"),
);
const RequesterDashboard = lazy(
  () => import("./features/requester/pages/RequesterDashboard.jsx"),
);
const DonorSettings = lazy(
  () => import("./features/donor/pages/DonorSettings.jsx"),
);
const DashboardLoading = ({ children }) => (
  <Suspense
    fallback={<LoadingSpinner message="Loading your dashboard..." fullScreen />}
  >
    {children}
  </Suspense>
);

// 1. Define the layout wrapper for public pages
const PublicLayout = () => (
  <Flex direction="column" minH="100vh">
    <Navbar />
    {/* Push page content down so the fixed navbar doesn't cover it */}
    {/* flex="1" pushes the footer down if the page content is short */}
    <Box pt="76px" flex="1">
      <Outlet />
    </Box>
    <Footer />
  </Flex>
);

export default function App() {
  return (
    <Suspense
      fallback={<LoadingSpinner message="Loading BloodLink..." fullScreen />}
    >
      <Routes>
        {/* PUBLIC ROUTES: Wrapped in the new PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RoleSelection mode="login" />} />
          <Route path="/register" element={<RoleSelection mode="register" />} />
          <Route path="/login/:roleId" element={<Login />} />
          <Route path="/register/:roleId" element={<Register />} />
        </Route>

        {/* Secret Internal Route */}
        <Route path="/staff-portal-secure" element={<AdminLogin />} />

        {/* SECURE ROUTES: Protected and wrapped in DashboardLayout (Sidebar only) */}
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
            <Route element={<ProtectedRoute allowedRoles={["Donor"]} />}>
              <Route
                path="/donor/dashboard"
                element={
                  <DashboardLoading>
                    <DonorDashboard />
                  </DashboardLoading>
                }
              />
              <Route
                path="/donor/settings"
                element={
                  <DashboardLoading>
                    <DonorSettings />
                  </DashboardLoading>
                }
              />
            </Route>

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
