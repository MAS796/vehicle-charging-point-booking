import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import chargingImg from "../assets/charging.jpg";
import "../styles/home.css";

export default function Home() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const findStations = async () => {
    setError("");
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );

      const { data } = await api.post("/stations/nearby", {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });

      setStations(data);
    } catch {
      setError("Backend not running yet or location denied.");
    }
  };

  return (
    <div className="home">
      <div className="home-hero">
        <img src={chargingImg} alt="EV Charging" />
        <div className="home-overlay">
          <h1>Smart EV Charging</h1>
          <p>Find, book, and manage EV charging easily.</p>
          <button onClick={findStations}>Find Nearby Stations</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <div className="container">
        {stations.map((s) => (
          <div key={s.id} className="card" onClick={() => navigate(`/station/${s.id}`)}>
            <h3>{s.name}</h3>
            <p>{s.address}</p>
            <p>{s.distance.toFixed(2)} km away</p>
          </div>
        ))}
      </div>
    </div>
  );
}
