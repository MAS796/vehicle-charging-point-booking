import { useState } from "react";
import api from "../services/api";

export default function NearbyStations() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const testNearby = async () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported by browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          console.log("Sending:", lat, lon);
          const res = await api.post("/stations/nearby", { lat, lon });
          console.log("Received:", res.data);
          setStations(res.data);
        } catch (err) {
          console.error("Nearby API error:", err?.response || err);
          setError(
            err?.response?.data?.detail ||
            err?.message ||
            "Backend not reachable."
          );
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

      {loading && <p>Finding stations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {stations.map((s) => (
        <div key={s.id} className="card">
          <h3>{s.name}</h3>
          <p>{s.address}</p>
          <p>{s.distance.toFixed(2)} km away</p>
        </div>
      ))}
    </div>
  );
}
