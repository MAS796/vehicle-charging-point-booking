import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.is_admin === true;

  return isAdmin ? children : <Navigate to="/" />;
}
