import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}) {
  const { user } = useAuth(); // Assuming your context exports 'user'

  // 1. Authentication Check: Are they logged in at all?
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 2. Authorization Check: Do they have permission for this specific page?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
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

    // If a user tries to access a page they shouldn't, route them to their specific home
    const fallbackRoute = dashboardRoutes[user.role] || "/";
    return <Navigate to={fallbackRoute} replace />;
  }

  // 3. Render: Supports both <ProtectedRoute><Page/></ProtectedRoute> and <Outlet /> layouts
  return children ? children : <Outlet />;
}
