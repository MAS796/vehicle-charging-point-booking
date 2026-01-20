import { useState } from "react";
import api from "../services/api";

export default function NearbyStations() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const testNearby = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const res = await api.post("/stations/nearby", { lat, lon });
          setStations(res.data);
        } catch (err) {
          setError("Failed to fetch nearby stations.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="container">
      <h2>Nearby Charging Stations</h2>
      <button onClick={testNearby}>Find Nearby Stations</button>

      {loading && <p>Finding nearby stations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {stations.map((s) => (
        <div key={s.id} className="card">
          <h3>{s.name}</h3>
          <p>{s.address}</p>
          <p><b>Distance:</b> {s.distance.toFixed(2)} km</p>
        </div>
      ))}
    </div>
  );
}
