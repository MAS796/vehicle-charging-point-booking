import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function NetworkMap() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([20.5937, 78.9629]); // Center of India
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
              <button className="view-btn">View Details →</button>
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

      <style>{`
        .network-map-container {
          min-height: 100vh;
          background: #f5f5f5;
        }

        /* Emergency Support Section */
        .emergency-support-section {
          background: linear-gradient(135deg, #e63946 0%, #a4161a 100%);
          padding: 50px 20px;
          color: white;
        }

        .emergency-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .emergency-info h1 {
          font-size: 3em;
          margin: 0 0 10px 0;
          font-weight: bold;
        }

        .emergency-info .sub-title {
          font-size: 1.3em;
          margin: 5px 0;
          color: #ffe0e0;
        }

        .emergency-info .description {
          font-size: 1em;
          color: #ffb3b3;
          margin-top: 10px;
        }

        .emergency-call-btn {
          background: white;
          color: #e63946;
          padding: 30px 40px;
          border-radius: 15px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          white-space: nowrap;
        }

        .emergency-call-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }

        .phone-icon {
          font-size: 2em;
        }

        .phone-number {
          font-size: 1.5em;
        }

        .tap-text {
          font-size: 0.8em;
          color: #999;
        }

        /* Network Stats Section */
        .network-stats-section {
          background: white;
          padding: 40px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .stats-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
          border-radius: 10px;
          text-align: center;
        }

        .stat-icon {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .stat-label {
          color: #666;
          font-size: 0.9em;
          font-weight: 500;
        }

        .stat-value {
          font-size: 2.5em;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
        }

        /* Map Section */
        .map-section {
          padding: 40px 20px;
          background: white;
          margin: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .map-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .map-header h2 {
          font-size: 2em;
          color: #333;
          margin: 0 0 10px 0;
        }

        .map-header p {
          color: #666;
          margin: 0;
        }

        .map-wrapper {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .map-loading, .map-empty {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          border-radius: 10px;
          color: #999;
          font-size: 1.1em;
        }

        .popup-content {
          font-size: 0.9em;
        }

        .popup-content h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .popup-content p {
          margin: 5px 0;
          color: #666;
        }

        /* Stations List Section */
        .stations-list-section {
          padding: 40px 20px;
          background: #f5f5f5;
        }

        .stations-list-section h2 {
          text-align: center;
          font-size: 2em;
          color: #333;
          margin-bottom: 30px;
        }

        .stations-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .station-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 4px solid #999;
        }

        .station-card.open {
          border-left-color: #4caf50;
        }

        .station-card.closed {
          border-left-color: #f44336;
          opacity: 0.7;
        }

        .station-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .station-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }

        .station-card h3 {
          margin: 0;
          font-size: 1.2em;
          color: #333;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: bold;
        }

        .status-badge.open {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.closed {
          background: #ffebee;
          color: #c62828;
        }

        .address {
          color: #666;
          font-size: 0.95em;
          margin: 10px 0;
        }

        .station-info {
          display: flex;
          gap: 15px;
          margin: 15px 0;
          font-size: 0.9em;
          color: #666;
        }

        .view-btn {
          width: 100%;
          padding: 10px;
          background: linear-gradient(90deg, #0066cc 0%, #0052a3 100%);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .view-btn:hover {
          background: linear-gradient(90deg, #0052a3 0%, #003d7a 100%);
          transform: scale(1.02);
        }

        /* Features Section */
        .features-section {
          padding: 60px 20px;
          background: white;
          margin-top: 40px;
        }

        .features-section h2 {
          text-align: center;
          font-size: 2em;
          color: #333;
          margin-bottom: 40px;
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .feature-card {
          text-align: center;
          padding: 30px 20px;
          background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .feature-icon {
          font-size: 3em;
          display: block;
          margin-bottom: 15px;
        }

        .feature-card h3 {
          font-size: 1.3em;
          color: #333;
          margin: 0 0 10px 0;
        }

        .feature-card p {
          color: #666;
          margin: 0;
          font-size: 0.95em;
        }

        @media (max-width: 768px) {
          .emergency-content {
            flex-direction: column;
            gap: 20px;
          }

          .emergency-info h1 {
            font-size: 2em;
          }

          .emergency-call-btn {
            padding: 20px 30px;
          }

          .map-wrapper {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
