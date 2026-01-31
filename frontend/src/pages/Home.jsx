import { useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const findStations = async () => {
    setError("");
    setLoading(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );

      const { data } = await api.post("/stations/nearby", {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      setStations(data || []);
      if (data.length === 0) {
        setError("No charging stations found within 10 km of your location.");
      }
    } catch (err) {
      console.error("Error details:", err);
      if (err.message && err.message.includes("Geolocation")) {
        setError("Location access denied. Please enable location permissions.");
      } else {
        const errorMsg = getErrorMessage(err, "Unknown error");
        setError("Failed to fetch nearby stations: " + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-overlay">
          <h1>Smart EV Charging</h1>
          <p>Find, book, and manage EV charging easily.</p>
          <button onClick={findStations} disabled={loading}>
            {loading ? "Searching..." : "Find Nearby Stations"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <div className="stations-container">
        {stations.length > 0 && (
          <div className="stations-grid">
            {stations.map((s) => (
              <div key={s.id} className="station-card" onClick={() => navigate(`/station/${s.id}`)}>
                <h3>{s.name}</h3>
                <p className="address">{s.address}</p>
                <p className="distance">📍 {s.distance.toFixed(2)} km away</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
