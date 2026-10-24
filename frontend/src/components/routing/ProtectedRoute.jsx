import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

// A clean mapping object prevents ugly URLs like "/BloodBankAdmin-dashboard"
// and safely routes them based on their exact database role.
const dashboardRoutes = {
  Donor: "/donor/dashboard",
  Requester: "/requester/dashboard",
  Organization: "/organization/dashboard",
  Hospital: "/hospital/dashboard",
  BloodBankAdmin: "/bloodbank/dashboard",
  SuperAdmin: "/superadmin/dashboard",
};

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}) {
  const { user, isLoading } = useAuth(); // Assuming your context exports 'user' and 'isLoading'

  // 1. Wait until session verification finishes.
  if (isLoading) {
    return <LoadingSpinner message="Checking Authentication..." fullScreen />;
  }

  // 2. Authentication Check: Reject unauthenticated users.
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 3. Authorization Check: Reject users who don't have the required role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a user tries to access a page they shouldn't, route them to their specific home
    const fallbackRoute = dashboardRoutes[user.role] || "/";
    return <Navigate to={fallbackRoute} replace />;
  }

  // 4. Render: Supports both <ProtectedRoute><Page/></ProtectedRoute> and <Outlet /> layouts
  return children ?? <Outlet />;
}
