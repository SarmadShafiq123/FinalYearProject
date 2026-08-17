import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "./Loader";
import { canAccessDashboard } from "../../utils/planAccess";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isEmailVerified && !user.googleId)
    return <Navigate to="/verify-email" replace />;

  if (!canAccessDashboard(user)) {
    return <Navigate to="/pricing" replace />;
  }

  return children;
};

export default ProtectedRoute;
