import { Link } from "react-router-dom";
import "../styles/admin.css";

export default function AdminDashboard() {
  return (
    <div className="container admin">
      <h1>Admin Dashboard</h1>
      <div className="admin-links">
        <Link to="/admin/stations">Manage Stations</Link>
        <Link to="/admin/bookings">View Bookings</Link>
        <Link to="/admin/nearby">Nearby Stations Test</Link>
      </div>
    </div>
  );
}
