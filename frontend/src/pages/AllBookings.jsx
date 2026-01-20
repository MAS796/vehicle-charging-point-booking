import { useEffect, useState } from "react";
import api from "../services/api";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/admin/bookings", {
      params: { user_id: user.id }
    })
      .then(res => setBookings(res.data))
      .catch(() => setError("Backend not running or no bookings yet."));
  }, []);

  return (
    <div className="container">
      <h2>All Bookings</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {bookings.length === 0 && !error && <p>No bookings yet.</p>}

      {bookings.map(b => (
        <div key={b.id} className="card">
          <p><strong>Name:</strong> {b.name}</p>
          <p><strong>Car:</strong> {b.car_number}</p>
          <p><strong>Status:</strong> {b.status}</p>
        </div>
      ))}
    </div>
  );
}
