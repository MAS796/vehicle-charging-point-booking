import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  if (!state) {
    return (
      <div className="container">
        <h2>No booking found</h2>
        <p>Please book a slot first.</p>
      </div>
    );
  }

  const { name, car_number, phone, hours, booking_id } = state;
  const amount = Number(hours) * 60; // ₹60 per hour

  const confirmPayment = async () => {
    try {
      await api.post("/payments/process", {
        booking_id,
        amount,
        phone,
      });
      navigate("/");
    } catch {
      setError("Payment failed. Backend not running yet.");
    }
  };

  return (
    <div className="container">
      <h2>Payment</h2>

      <div className="card">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Car Number:</strong> {car_number}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Hours:</strong> {hours}</p>
        <p><strong>Total Amount:</strong> ₹{amount}</p>

        <button onClick={confirmPayment}>Confirm Payment</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
