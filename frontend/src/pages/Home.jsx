import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from "../assets/ev-hero.jpg";
import "../styles/home-pro.css";

const indiaPins = [
  { left: "32%", top: "38%" },
  { left: "35%", top: "47%" },
  { left: "41%", top: "57%" },
  { left: "44%", top: "40%" },
  { left: "50%", top: "50%" },
  { left: "56%", top: "61%" },
  { left: "61%", top: "46%" },
  { left: "66%", top: "56%" },
  { left: "70%", top: "66%" },
];

const cityPins = [
  { left: "16%", top: "62%" },
  { left: "23%", top: "52%" },
  { left: "31%", top: "48%" },
  { left: "38%", top: "60%" },
  { left: "47%", top: "44%" },
  { left: "56%", top: "53%" },
  { left: "65%", top: "46%" },
  { left: "73%", top: "57%" },
  { left: "81%", top: "50%" },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="home-shell">
      <section className="hero-stage">
        <div className="hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hero-overlay" />
        <div className="hero-glow" />

        <div className="hero-layout">
          <div className="hero-copy">
            <h1>Charge Your Journey: Fast, Reliable, Connected EV Solutions.</h1>
            <p>Locate stations, manage your account, and plan your trip with real-time data.</p>
            <button type="button" onClick={() => navigate("/register")}>{t("get_started")}</button>
          </div>

          <aside className="network-card">
            <p className="card-kicker">NETWORK MAP</p>
            <div className="map-surface india-map">
              {indiaPins.map((pin, idx) => (
                <span key={idx} className="map-pin" style={{ left: pin.left, top: pin.top }} />
              ))}
            </div>

            <div className="network-links">
              <button type="button" onClick={() => navigate("/stations")}>Find Stations</button>
              <button type="button" onClick={() => navigate("/dashboard")}>Smart Dashboard</button>
              <button type="button" onClick={() => navigate("/companies")}>Enterprise</button>
            </div>
          </aside>
        </div>
      </section>

      <section className="nearby-card">
        <h2>Find Nearby Charging Stations</h2>
        <div className="map-surface city-map">
          <button
            type="button"
            className="map-search"
            onClick={() => navigate("/nearby-stations")}
            aria-label="Search charging stations"
          >
            <svg
              className="map-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Search for location...</span>
          </button>
          {cityPins.map((pin, idx) => (
            <span key={idx} className="map-pin" style={{ left: pin.left, top: pin.top }} />
          ))}
        </div>
        <div className="nearby-actions">
          <button type="button" onClick={() => navigate("/nearby-stations")}>Open Nearby</button>
          <button type="button" onClick={() => navigate("/network-map")}>Open Network Map</button>
        </div>
      </section>

      <section className="home-stats">
        <article className="stat-card">
          <h3>25+</h3>
          <p>{t("charging_stations")}</p>
        </article>
        <article className="stat-card">
          <h3>1200+</h3>
          <p>{t("successful_bookings")}</p>
        </article>
        <article className="stat-card">
          <h3>98%</h3>
          <p>{t("slot_utilization")}</p>
        </article>
        <article className="stat-card">
          <h3>99.9%</h3>
          <p>{t("system_uptime")}</p>
        </article>
      </section>
    </div>
  );
}
