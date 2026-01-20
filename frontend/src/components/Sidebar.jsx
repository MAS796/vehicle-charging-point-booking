import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/admin">Dashboard</Link>
      <Link to="/admin/stations">Stations</Link>
      <Link to="/admin/bookings">Bookings</Link>
    </aside>
  );
}
