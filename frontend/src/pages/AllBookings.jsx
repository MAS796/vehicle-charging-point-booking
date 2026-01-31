import { useEffect, useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/");
        setBookings(res.data || []);
      } catch (err) {
        setError("Failed to fetch bookings: " + getErrorMessage(err));
      }
    };
    fetchBookings();
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
