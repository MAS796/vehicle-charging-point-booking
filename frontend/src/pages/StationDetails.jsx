
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import "../styles/station-details.css";
import AIPrediction from "../components/AIPrediction";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Failed to parse stored user:", err);
    return null;
  }
}

export default function StationDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useState(() => getStoredUser());
  const [station, setStation] = useState(null);
  const [allStations, setAllStations] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    car_number: "",
    phone: user?.phone || "",
    hours: "1",
  }));

  useEffect(() => {
    // Fetch station details
    api.get(`/stations/${id}`)
      .then(res => {
        setStation(res.data);
      })
      .catch(err => {
        setError("Failed to load station details: " + getErrorMessage(err));
      });
    
    // Fetch all stations for stats
    api.get("/stations/")
      .then(res => {
        setAllStations(res.data);
      })
      .catch(err => {
        console.error("Failed to load stations:", err);
      });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isStationOpen = (openingTime, closingTime) => {
    const now = new Date();
    const [oh, om, os] = openingTime.split(":").map(Number);
    const [ch, cm, cs] = closingTime.split(":").map(Number);
    const open = new Date();
    open.setHours(oh, om, os || 0);
    const close = new Date();
    close.setHours(ch, cm, cs || 0);
    return now >= open && now <= close;
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      setError(t("login_to_book"));
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
      setError(getErrorMessage(err, "Booking failed"));
    }
  };

  if (!station) return <div className="loading">{t("loading_stations")}</div>;

  const open = station.is_open ?? isStationOpen(station.opening_time, station.closing_time);
  const totalSlots = allStations.reduce((sum, s) => sum + (s.available_slots || 0), 0);
  const activeStations = allStations.filter(s => s.is_open).length;

  return (
    <div className="station-details-container">
      
      {/* Network Statistics Banner */}
      <section className="network-stats-banner">
        <div className="stats-content">
          <h1>⚡ EV Charging Network</h1>
          <p>Growing charging infrastructure across India</p>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total Stations</p>
              <p className="stat-value">{allStations.length}+</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Active Now</p>
              <p className="stat-value">{activeStations}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Slots</p>
              <p className="stat-value">{totalSlots}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">24/7 Support</p>
              <p className="stat-value">✅ Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Support Banner */}
      <section className="emergency-banner">
        <div className="emergency-content">
          <div>
            <h3>🚨 Emergency Charging Support</h3>
            <p>24/7 Roadside Assistance in 5 Major Cities</p>
          </div>
          <a href="tel:18002098282" className="emergency-btn">
            📞 1800-209-8282
          </a>
        </div>
      </section>

      {/* Station Details */}
      <div className="station-details">
        <div className="station-header">
          <h2>{station.name}</h2>
          <span className={`status-badge ${open ? "open" : "closed"}`}>
            {open ? "🟢 OPEN" : "🔴 CLOSED"}
          </span>
        </div>
        
        <div className="station-info">
          <p><strong>Address:</strong> {station.address}</p>
          <p><strong>Hours:</strong> {station.opening_time} – {station.closing_time}</p>
          <p><strong>Available Slots:</strong> {station.available_slots}</p>
        </div>

        {/* Charger Types */}
        <div className="charger-types">
          <h3>Available Chargers</h3>
          <div className="charger-list">
            <div className="charger-item">
              <span>⚡ Fast Charge (50kW)</span>
              <span className="status-available">Available</span>
            </div>
            <div className="charger-item">
              <span>⚡⚡ Super Charge (150kW)</span>
              <span className="status-available">Available</span>
            </div>
            <div className="charger-item">
              <span>🔌 DC Charger</span>
              <span className="status-available">Available</span>
            </div>
          </div>
        </div>

        {/* AI Prediction Feature */}
        <div className="ai-section">
          <h3>🤖 AI Predictions</h3>
          {/* AI Prediction Component */}
          {/* If not already imported, add: import AIPrediction from '../components/AIPrediction'; */}
          <AIPrediction />
        </div>

        {open ? (
          <>
            <form className="form" onSubmit={submitBooking}>
              <h3>{t("book_your_slot")}</h3>
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
              <button type="submit" disabled={!user} className="submit-btn">
                {user ? t("confirm_booking") : t("login_to_book")}
              </button>
            </form>
            
            <div className="payment-section">
              <h3>Payment</h3>
              <p style={{ color: "#94a3b8", marginTop: 8 }}>
                Payment will be done after you confirm the booking (next step).
              </p>
            </div>
          </>
        ) : (
          <div className="closed-message">
            <p>🔴 Station is currently closed</p>
            <p>Opens at: {station.opening_time}</p>
          </div>
        )}

        {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}
      </div>
    </div>
  );
}


