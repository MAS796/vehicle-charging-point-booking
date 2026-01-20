import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAdmin = true; // replace later with auth

  return isAdmin ? children : <Navigate to="/" />;
}
