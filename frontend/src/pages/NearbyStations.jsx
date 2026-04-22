import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNearbyStations } from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function NearbyStations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          const data = await getNearbyStations(lat, lon);
          setStations(data);
          if (data.length === 0) {
            setError("No charging stations found within 10 km of your location.");
          }
        } catch (err) {
          setError(getErrorMessage(err, "Failed to fetch nearby stations. Please try again."));
        } finally {
          setLoading(false);
        }
      },
      (geolocationError) => {
        let errorMsg = "Location permission denied.";

        if (geolocationError.code === 1) {
          errorMsg = "Location access denied. Please enable location permissions in your browser settings and try again.";
        } else if (geolocationError.code === 2) {
          errorMsg = "Unable to retrieve your location. Please check your internet connection and try again.";
        } else if (geolocationError.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }

        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="container" style={{ color: "#e5e7eb" }}>
      <h2 style={{ color: "#ffffff", marginBottom: "12px" }}>{t("nearby_stations")}</h2>

      <div
        style={{
          backgroundColor: "#f8fafc",
          color: "#111827",
          border: "1px solid #d1d5db",
          padding: "16px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        <p style={{ marginBottom: "8px" }}>
          <strong>How to find nearby stations:</strong>
        </p>
        <ol>
          <li>Click "Find Nearby Stations" button</li>
          <li>Allow location access when prompted by your browser</li>
          <li>We will find all charging stations within 10 km of your location</li>
        </ol>
      </div>

      <button
        onClick={testNearby}
        disabled={loading}
        style={{
          padding: "12px 20px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)",
          color: "#ffffff",
          fontWeight: 600,
        }}
      >
        {loading ? t("finding_location") : t("find_nearby_stations")}
      </button>

      {loading && <p style={{ color: "#2196F3" }}>Getting your location...</p>}
      {error && (
        <div
          style={{
            color: "#d32f2f",
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            borderLeft: "4px solid #d32f2f",
          }}
        >
          <strong>Note:</strong> {error}
        </div>
      )}

      {stations.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ color: "#ffffff", marginBottom: "12px" }}>
            Found {stations.length} station(s)
          </h3>
          {stations.map((station) => (
            <div
              key={station.id}
              style={{
                marginBottom: "15px",
                background: "#f8fafc",
                color: "#111827",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <h4 style={{ marginBottom: "8px", color: "#0f172a" }}>{station.name}</h4>
              {station.location && (
                <p>
                  <strong>Location:</strong> {station.location}
                </p>
              )}
              <p>
                <strong>Address:</strong> {station.address}
              </p>
              {station.operator && (
                <p>
                  <strong>Operator:</strong> {station.operator}
                </p>
              )}
              {station.charger_types && (
                <p>
                  <strong>Charger Types:</strong> {station.charger_types}
                </p>
              )}
              <p>
                <strong>Distance:</strong> {station.distance.toFixed(2)} km away
              </p>
              <p>
                <strong>Available Slots:</strong> {station.available_slots}
              </p>
              <p>
                <strong>Phone:</strong> {station.phone}
              </p>
              <button
                onClick={() => navigate(`/station/${station.id}`)}
                style={{
                  marginTop: "10px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("book_slot")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
