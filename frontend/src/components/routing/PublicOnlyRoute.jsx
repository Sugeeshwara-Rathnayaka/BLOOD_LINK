// components/routing/PublicOnlyRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomePath } from "../layout/dashboardConfig";
import LoadingSpinner from "../common/LoadingSpinner";

export default function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner message="Loading..." fullScreen />;

  if (user) {
    // Honour the page they were originally headed to, otherwise their dashboard
    const target = location.state?.from?.pathname ?? getHomePath(user.role);
    return <Navigate to={target} replace />;
  }

  return children ?? <Outlet />;
}
