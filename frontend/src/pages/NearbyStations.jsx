import { useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function NearbyStations() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const testNearby = async () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please use a modern browser like Chrome, Firefox, or Edge.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          console.log("Location found:", lat, lon);
          const res = await api.post("/stations/nearby", { lat, lon });
          console.log("Received stations:", res.data);
          setStations(res.data);
          if (res.data.length === 0) {
            setError("No charging stations found within 10 km of your location.");
          }
        } catch (err) {
          console.error("Nearby API error:", err?.response || err);
          setError(getErrorMessage(err, "Failed to fetch nearby stations. Please try again."));
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Location permission denied.";
        
        if (error.code === 1) {
          errorMsg = "Location access denied. Please enable location permissions in your browser settings and try again.";
        } else if (error.code === 2) {
          errorMsg = "Unable to retrieve your location. Please check your internet connection and try again.";
        } else if (error.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }
        
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="container">
      <h2>Nearby Charging Stations</h2>
      
      <div style={{ 
        backgroundColor: "#f0f0f0", 
        padding: "15px", 
        borderRadius: "8px", 
        marginBottom: "20px",
        fontSize: "14px"
      }}>
        <p><strong>How to find nearby stations:</strong></p>
        <ol>
          <li>Click "Find Nearby Stations" button</li>
          <li>Allow location access when prompted by your browser</li>
          <li>We will find all charging stations within 10 km of your location</li>
        </ol>
      </div>

      <button onClick={testNearby} disabled={loading} style={{
        padding: "10px 20px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1
      }}>
        {loading ? "Finding your location..." : "Find Nearby Stations"}
      </button>

      {loading && <p style={{ color: "#2196F3" }}>📍 Getting your location...</p>}
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#ffebee",
          borderRadius: "4px",
          borderLeft: "4px solid #d32f2f"
        }}>
          <strong>Note:</strong> {error}
        </div>
      )}

      {stations.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Found {stations.length} station(s)</h3>
          {stations.map((s) => (
            <div key={s.id} className="card" style={{ marginBottom: "15px" }}>
              <h4>{s.name}</h4>
              <p><strong>Address:</strong> {s.address}</p>
              <p><strong>Distance:</strong> {s.distance.toFixed(2)} km away</p>
              <p><strong>Available Slots:</strong> {s.available_slots}</p>
              <p><strong>Phone:</strong> {s.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
