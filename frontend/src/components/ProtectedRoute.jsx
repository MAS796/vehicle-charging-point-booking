import { Navigate } from "react-router-dom";

/**
 * Protected Route Component
 * - Checks if user is authenticated
 * - Optionally checks for specific role (admin, user, company)
 * 
 * Usage:
 * <ProtectedRoute><Component /></ProtectedRoute>  // Just auth check
 * <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>  // Admin only
 */
export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in - redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check if specified
  if (role) {
    // Check for admin role
    if (role === "admin" && !user.is_admin) {
      return <Navigate to="/" replace />;
    }
    
    // Check for specific role
    if (role !== "admin" && user.role !== role) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
