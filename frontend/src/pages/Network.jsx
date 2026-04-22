import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/network.css";

const Network = () => {
  // Animated counter state
  const [counters, setCounters] = useState({
    stations: 0,
    cities: 0,
    users: 0,
    charging: 0
  });

  // Animate counters on mount
  useEffect(() => {
    const targets = {
      stations: 500,
      cities: 50,
      users: 25000,
      charging: 150000
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounters({
        stations: Math.floor(targets.stations * progress),
        cities: Math.floor(targets.cities * progress),
        users: Math.floor(targets.users * progress),
        charging: Math.floor(targets.charging * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const metroCities = [
    { name: "Delhi NCR", stations: 85, coverage: "98%" },
    { name: "Mumbai", stations: 72, coverage: "95%" },
    { name: "Bangalore", stations: 68, coverage: "96%" },
    { name: "Hyderabad", stations: 45, coverage: "90%" },
    { name: "Chennai", stations: 42, coverage: "88%" },
    { name: "Pune", stations: 38, coverage: "92%" },
    { name: "Kolkata", stations: 35, coverage: "85%" },
    { name: "Ahmedabad", stations: 30, coverage: "82%" },
    { name: "Jaipur", stations: 25, coverage: "78%" },
    { name: "Lucknow", stations: 22, coverage: "75%" },
    { name: "Chandigarh", stations: 18, coverage: "80%" },
    { name: "Kochi", stations: 15, coverage: "72%" }
  ];

  const highways = [
    { name: "Mumbai-Pune Expressway", stations: 12, length: "94 km" },
    { name: "Delhi-Jaipur Highway (NH-48)", stations: 18, length: "281 km" },
    { name: "Bangalore-Mysore Expressway", stations: 8, length: "117 km" },
    { name: "Chennai-Bangalore Highway", stations: 15, length: "346 km" },
    { name: "Delhi-Agra Expressway", stations: 10, length: "165 km" },
    { name: "Ahmedabad-Vadodara Expressway", stations: 6, length: "93 km" }
  ];

  return (
    <div className="network-page">
      {/* Hero Section */}
      <section className="network-hero">
        <div className="container">
          <div className="hero-badge">⚡ Pan India EV Charging Network</div>
          <h1>India's Largest EV Charging Infrastructure</h1>
          <p>
            Powering the electric revolution across the nation with our extensive network 
            of fast charging stations in metros, highways, and tier-2 cities.
          </p>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-number">{counters.stations}+</div>
              <div className="stat-label">Charging Stations</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏙️</div>
              <div className="stat-number">{counters.cities}+</div>
              <div className="stat-label">Cities Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">{counters.users.toLocaleString()}+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔋</div>
              <div className="stat-number">{counters.charging.toLocaleString()}+</div>
              <div className="stat-label">Charging Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* India Map Coverage Section */}
      <section className="map-section">
        <div className="container">
          <h2>🗺️ Coverage Across India</h2>
          <p className="section-subtitle">
            From the mountains of Himachal to the beaches of Kerala, we've got you covered
          </p>
          
          <div className="india-map-container">
            <div className="map-visual">
              {/* SVG India Map Representation */}
              <div className="map-overlay">
                <div className="region north">
                  <span className="region-label">North</span>
                  <span className="region-count">120+ stations</span>
                </div>
                <div className="region south">
                  <span className="region-label">South</span>
                  <span className="region-count">140+ stations</span>
                </div>
                <div className="region east">
                  <span className="region-label">East</span>
                  <span className="region-count">60+ stations</span>
                </div>
                <div className="region west">
                  <span className="region-label">West</span>
                  <span className="region-count">100+ stations</span>
                </div>
                <div className="region central">
                  <span className="region-label">Central</span>
                  <span className="region-count">80+ stations</span>
                </div>
              </div>
            </div>
            
            <div className="map-legend">
              <h4>Network Density</h4>
              <div className="legend-item">
                <span className="legend-color high"></span>
                <span>High Coverage (50+ stations)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color medium"></span>
                <span>Medium Coverage (20-50 stations)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color low"></span>
                <span>Growing Coverage (&lt;20 stations)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metro Cities Section */}
      <section className="metros-section">
        <div className="container">
          <h2>🏙️ Major Metro Cities</h2>
          <p className="section-subtitle">
            Premium charging infrastructure in India's busiest cities
          </p>
          
          <div className="metros-grid">
            {metroCities.map((city, index) => (
              <div key={index} className="metro-card">
                <div className="metro-rank">#{index + 1}</div>
                <h3>{city.name}</h3>
                <div className="metro-stats">
                  <div className="metro-stat">
                    <span className="value">{city.stations}</span>
                    <span className="label">Stations</span>
                  </div>
                  <div className="metro-stat">
                    <span className="value">{city.coverage}</span>
                    <span className="label">Coverage</span>
                  </div>
                </div>
                <div className="coverage-bar">
                  <div 
                    className="coverage-fill" 
                    style={{ width: city.coverage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highway Corridors Section */}
      <section className="highways-section">
        <div className="container">
          <h2>🛣️ Highway Charging Corridors</h2>
          <p className="section-subtitle">
            Long-distance travel made easy with strategically placed charging points
          </p>
          
          <div className="highways-grid">
            {highways.map((highway, index) => (
              <div key={index} className="highway-card">
                <div className="highway-icon">🛣️</div>
                <h4>{highway.name}</h4>
                <div className="highway-details">
                  <span><strong>{highway.stations}</strong> stations</span>
                  <span><strong>{highway.length}</strong> stretch</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charger Types Section */}
      <section className="chargers-section">
        <div className="container">
          <h2>⚡ Charger Types Available</h2>
          
          <div className="chargers-grid">
            <div className="charger-card dc">
              <div className="charger-badge">FAST</div>
              <h3>DC Fast Chargers</h3>
              <div className="charger-power">60kW - 150kW</div>
              <ul>
                <li>✓ 80% charge in 30-45 mins</li>
                <li>✓ CCS2 & CHAdeMO connectors</li>
                <li>✓ Ideal for highway stops</li>
                <li>✓ 200+ locations</li>
              </ul>
            </div>
            
            <div className="charger-card ac">
              <div className="charger-badge">SMART</div>
              <h3>AC Smart Chargers</h3>
              <div className="charger-power">7.4kW - 22kW</div>
              <ul>
                <li>✓ Full charge in 4-8 hours</li>
                <li>✓ Type 2 connector</li>
                <li>✓ Perfect for malls & offices</li>
                <li>✓ 300+ locations</li>
              </ul>
            </div>
            
            <div className="charger-card ultra">
              <div className="charger-badge">ULTRA</div>
              <h3>Ultra-Fast Chargers</h3>
              <div className="charger-power">150kW - 350kW</div>
              <ul>
                <li>✓ 80% charge in 15-20 mins</li>
                <li>✓ Premium highway locations</li>
                <li>✓ Latest EV compatible</li>
                <li>✓ Coming to 50+ locations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Explore?</h2>
          <p>Find your nearest charging station on our interactive map</p>
          <div className="cta-buttons">
            <Link to="/network-map" className="cta-primary">
              Open Live Map
            </Link>
            <Link to="/companies" className="cta-secondary">
              View All Partners
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Network;
