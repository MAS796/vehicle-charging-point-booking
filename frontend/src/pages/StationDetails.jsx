import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    car_number: "",
    phone: "",
    hours: "1",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Pre-fill form with user data
      setForm((prev) => ({
        ...prev,
        name: userData.name || "",
        phone: userData.phone || "",
      }));
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login first to book a slot");
      navigate("/login");
      return;
    }

    try {
      const { data } = await api.post("/bookings/", {
        station_id: parseInt(id),
        user_id: user.id,
        ...form,
      });
      navigate("/payment", { state: data });
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed");
    }
  };

  return (
    <div className="container">
      <h2>Book Charging Slot</h2>

      {!user && (
        <div style={{ background: "#fee", padding: "12px", borderRadius: "6px", marginBottom: "20px" }}>
          <p style={{ color: "#c33" }}>
            You must <strong>login first</strong> to make a booking.{" "}
            <a href="/login" style={{ color: "#0066cc" }}>
              Login here
            </a>
          </p>
        </div>
      )}

      <form className="form" onSubmit={submitBooking}>
        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={!user}
        />
        <input
          name="car_number"
          placeholder="Car Number (e.g., MH02AB1234)"
          value={form.car_number}
          onChange={handleChange}
          required
          disabled={!user}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          disabled={!user}
        />
        <select name="hours" value={form.hours} onChange={handleChange} disabled={!user}>
          <option value="1">1 Hour</option>
          <option value="2">2 Hours</option>
          <option value="3">3 Hours</option>
          <option value="4">4 Hours</option>
        </select>
        <button type="submit" disabled={!user}>
          {user ? "Confirm Booking" : "Login to Book"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}
    </div>
  );
}
