import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    car_number: "",
    phone: "",
    hours: "1",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/bookings", {
        station_id: id,
        ...form,
      });
      navigate("/payment", { state: data });
    } catch {
      setError("Booking failed. Backend not running yet.");
    }
  };

  return (
    <div className="container">
      <h2>Book Charging Slot</h2>

      <form className="form" onSubmit={submitBooking}>
        <input name="name" placeholder="Your Name" onChange={handleChange} required />
        <input name="car_number" placeholder="Car Number" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <select name="hours" onChange={handleChange}>
          <option value="1">1 Hour</option>
          <option value="2">2 Hours</option>
          <option value="3">3 Hours</option>
        </select>
        <button type="submit">Confirm Booking</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
