import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "../styles/network-map.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function NetworkMap() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([20.5937, 78.9629]); // Center of India
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stations");
      setStations(res.data);
    } catch (err) {
      console.error("Error fetching stations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="network-map-container">
      {/* Emergency Support Banner */}
      <section className="emergency-support-section">
        <div className="emergency-content">
          <div className="emergency-info">
            <h1>🚨 Emergency Charging Support</h1>
            <p className="sub-title">24/7 Roadside Assistance in 5 Major Cities</p>
            <p className="description">Stranded with a low battery? We're here to help!</p>
          </div>
          <a href="tel:19001110000" className="emergency-call-btn">
            <span className="phone-icon">📞</span>
            <span className="phone-number">1900-111-0000</span>
            <span className="tap-text">Tap to Call</span>
          </a>
        </div>
      </section>

      {/* Network Statistics */}
      <section className="network-stats-section">
        <div className="stats-wrapper">
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <span className="stat-label">Active Stations</span>
            <span className="stat-value">{stations.filter(s => s.is_open).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔌</span>
            <span className="stat-label">Total Slots</span>
            <span className="stat-value">{stations.reduce((sum, s) => sum + (s.available_slots || 0), 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏢</span>
            <span className="stat-label">Stations</span>
            <span className="stat-value">{stations.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Live Tracking</span>
            <span className="stat-value">Real-time</span>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="map-section">
        <div className="map-header">
          <h2>📍 Interactive Network Map</h2>
          <p>Click on any marker to see station details</p>
        </div>

        {loading ? (
          <div className="map-loading">Loading map...</div>
        ) : stations.length === 0 ? (
          <div className="map-empty">No stations found</div>
        ) : (
          <div className="map-wrapper">
            <MapContainer
              center={center}
              zoom={5}
              style={{ height: "500px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {stations.map((station) => (
                station.latitude && station.longitude && (
                  <Marker
                    key={station.id}
                    position={[station.latitude, station.longitude]}
                    onClick={() => setSelectedStation(station)}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h4>{station.name}</h4>
                        <p><strong>Address:</strong> {station.address}</p>
                        <p><strong>Slots:</strong> {station.available_slots}</p>
                        <p><strong>Status:</strong> {station.is_open ? "🟢 Open" : "🔴 Closed"}</p>
                        <p><strong>Hours:</strong> {station.opening_time} - {station.closing_time}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}
      </section>

      {/* Station List */}
      <section className="stations-list-section">
        <h2>📋 All Charging Stations</h2>
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
                  {station.is_open ? "🟢 Open" : "🔴 Closed"}
                </span>
              </div>
              <p className="address">📍 {station.address}</p>
              <div className="station-info">
                <span>🔌 {station.available_slots} slots</span>
                <span>⏰ {station.opening_time} - {station.closing_time}</span>
              </div>
              <button 
                className="view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/station/${station.id}`);
                }}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Network?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Fast Charging</h3>
            <p>50kW to 150kW charging speeds available</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🗺️</span>
            <h3>Pan India Network</h3>
            <p>Charging stations across India for your journey</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>Real-time Updates</h3>
            <p>Live availability and station status tracking</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🆘</span>
            <h3>24/7 Support</h3>
            <p>Emergency assistance anytime, anywhere</p>
          </div>
        </div>
      </section>
    </div>
  );
}
