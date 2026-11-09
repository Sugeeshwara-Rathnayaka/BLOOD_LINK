import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomePath } from "../layout/dashboardConfig.js";
import LoadingSpinner from "../common/LoadingSpinner";

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}) {
  const { user, isLoading } = useAuth(); // Assuming context exports 'user' and 'isLoading'
  const location = useLocation();

  // 1. Wait until session verification finishes.
  if (isLoading)
    return <LoadingSpinner message="Checking Authentication..." fullScreen />;

  // 2. Authentication Check: Reject unauthenticated users.
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />; // remember where they were headed so login can send them back
  }

  // 3. Authorization Check: Reject users who don't have the required role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />; // If a user tries to access a page they shouldn't, route them to their specific home
  }

  // 4. Render: Supports both <ProtectedRoute><Page/></ProtectedRoute> and <Outlet /> layouts
  return children ?? <Outlet />;
}
