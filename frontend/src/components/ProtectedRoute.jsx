import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protected Route Component
 * - Checks if user is authenticated
 * - Optionally checks for specific role (admin, user, company)
 */
export default function ProtectedRoute({ children, role }) {
  const { user, token, getRole } = useAuth();
  const storedRole = (getRole() || "").toLowerCase();

  // Not logged in - redirect to appropriate login
  if (!token || !user) {
    if (role === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const requiredRole = role.toLowerCase();
    const resolvedRole = (
      user?.role ||
      (user?.is_admin ? "admin" : storedRole || "user")
    ).toLowerCase();

    if (requiredRole === "admin") {
      const isAdmin = user.is_admin || resolvedRole === "admin";
      if (!isAdmin) {
        return <Navigate to="/" replace />;
      }
    } else if (resolvedRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
