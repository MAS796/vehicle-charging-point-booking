import "../styles/about.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>EV Charging Management System</h1>
        <p>
          A smart, scalable platform for managing electric vehicle charging
          stations, bookings, and payments.
        </p>
      </div>

      <div className="about-section">
        <h2>What This Platform Does</h2>
        <ul>
          <li>🔍 Find nearby EV charging stations</li>
          <li>📅 Book charging slots easily</li>
          <li>💳 Secure and simple payment flow</li>
          <li>📊 Admin dashboard for monitoring usage</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>Technology Stack</h2>
        <div className="tech-grid">
          <div className="tech-card">⚛ React Frontend</div>
          <div className="tech-card">⚡ FastAPI Backend</div>
          <div className="tech-card">🗄 PostgreSQL Database</div>
          <div className="tech-card">🌐 REST API Architecture</div>
        </div>
      </div>

      <div className="about-section">
        <h2>Why This Matters</h2>
        <p>
          This system reduces waiting time, optimizes station usage, and improves
          the EV charging experience through automation and real-time data.
        </p>
      </div>
    </div>
  );
}
