import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StationMap from "../components/StationMap";
import api from "../services/api";
import "../styles/network-map.css";

export default function NetworkMap() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const mapCenter = useMemo(() => [20.5937, 78.9629], []);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/stations");
        setStations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return (
    <div className="network-map-container">
      <section className="map-section">
        <div className="map-header">
          <h2>Map-Based Station Discovery</h2>
          <p>Discover all available charging stations and open booking instantly.</p>
        </div>

        {loading ? (
          <div className="map-loading">Loading map...</div>
        ) : (
          <StationMap
            stations={stations}
            center={mapCenter}
            zoom={5}
            height={500}
            onSelectStation={setSelectedStation}
            onOpenStation={(station) => navigate(`/station/${station.id}`)}
          />
        )}
      </section>

      <section className="stations-list-section">
        <h2>All Charging Stations</h2>
        <div className="stations-grid">
          {stations.map((station) => (
            <div
              key={station.id}
              className={`station-card ${station.is_open ? "open" : "closed"}`}
              onClick={() => setSelectedStation(station)}
            >
              <div className="station-card-header">
                <h3>{station.name}</h3>
                <span className={`status-badge ${station.is_open ? "open" : "closed"}`}>
                  {station.is_open ? "Open" : "Closed"}
                </span>
              </div>

              <p className="address">{station.address}</p>
              <div className="station-info">
                <span>{station.available_slots} slots</span>
                <span>
                  {station.opening_time} - {station.closing_time}
                </span>
              </div>

              <button
                className="view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/station/${station.id}`);
                }}
              >
                View Details and Book
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedStation ? (
        <section className="map-section">
          <div className="map-header" style={{ textAlign: "left", marginBottom: 16 }}>
            <h2>{selectedStation.name}</h2>
          </div>
          <p>
            <strong>Address:</strong> {selectedStation.address}
          </p>
          <p>
            <strong>Available Slots:</strong> {selectedStation.available_slots}
          </p>
          <p>
            <strong>Status:</strong> {selectedStation.is_open ? "Open" : "Closed"}
          </p>
          <p>
            <strong>Hours:</strong> {selectedStation.opening_time} - {selectedStation.closing_time}
          </p>
          <button
            className="view-btn"
            style={{ width: "auto", marginTop: 10, padding: "10px 16px" }}
            onClick={() => navigate(`/station/${selectedStation.id}`)}
          >
            Go to Booking Slot
          </button>
        </section>
      ) : null}
    </div>
  );
}
