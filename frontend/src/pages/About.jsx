import "../styles/about.css";

export default function About() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-badge">⚡ EV Charging Management Platform</div>
        <h1 className="about-hero-title">
          Intelligent Infrastructure for Smart Electric Mobility
        </h1>
        <p className="about-hero-subtitle">
          The EV Charging Management System is a scalable, full-stack web platform designed to streamline the discovery, booking, and administration of electric vehicle charging stations.
        </p>
      </section>

      {/* Platform Overview */}
      <section className="about-section">
        <h2>🌍 Platform Overview</h2>
        <p className="section-description">
          This application provides a centralized digital ecosystem where:
        </p>
        <div className="features-grid">
          <div className="feature-card card-purple">
            <div className="feature-icon">🔍</div>
            <h3>Users can discover nearby EV charging stations</h3>
            <p>Real-time availability and location-based search for seamless station discovery.</p>
          </div>
          <div className="feature-card card-blue">
            <div className="feature-icon">📅</div>
            <h3>Charging slots can be reserved in real time</h3>
            <p>Structured booking workflows with instant confirmation and slot management.</p>
          </div>
          <div className="feature-card card-green">
            <div className="feature-icon">💳</div>
            <h3>Secure payment flows ensure seamless transactions</h3>
            <p>Integrated digital payments with transaction tracking and secure processing.</p>
          </div>
          <div className="feature-card card-orange">
            <div className="feature-icon">📊</div>
            <h3>Administrators monitor system activity through a dynamic dashboard</h3>
            <p>Real-time analytics and operational monitoring for station management.</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="about-section">
        <h2>🚀 Core Features</h2>
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon">🔍</div>
            <h3>Smart Station Discovery</h3>
            <ul>
              <li>✓ Geolocation-based nearby station search</li>
              <li>✓ Real-time slot availability display</li>
              <li>✓ Distance-based sorting</li>
            </ul>
          </div>
          <div className="feature-box">
            <div className="feature-icon">📅</div>
            <h3>Intelligent Booking System</h3>
            <ul>
              <li>✓ Structured time-slot reservation</li>
              <li>✓ Automated availability validation</li>
              <li>✓ Real-time booking confirmation</li>
            </ul>
          </div>
          <div className="feature-box">
            <div className="feature-icon">💳</div>
            <h3>Secure Payment Flow</h3>
            <ul>
              <li>✓ Integrated digital payment interface</li>
              <li>✓ Transaction tracking</li>
              <li>✓ Booking-payment linkage</li>
            </ul>
          </div>
          <div className="feature-box">
            <div className="feature-icon">📊</div>
            <h3>Administrative Control Panel</h3>
            <ul>
              <li>✓ Station management (Add / Update / Monitor)</li>
              <li>✓ Booking analytics overview</li>
              <li>✓ System usage tracking</li>
              <li>✓ Real-time operational monitoring</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="about-section">
        <h2>🏗 Technical Architecture</h2>
        <p className="section-description">The system follows a clean, modular architecture separating frontend, backend, and data layers.</p>
        <div className="tech-grid">
          <div className="tech-card tech-frontend">
            <div className="tech-icon">⚛</div>
            <h3>Frontend</h3>
            <ul>
              <li>• React.js</li>
              <li>• Component Architecture</li>
              <li>• Axios REST API</li>
              <li>• State Management</li>
            </ul>
          </div>
          <div className="tech-card tech-backend">
            <div className="tech-icon">⚡</div>
            <h3>Backend</h3>
            <ul>
              <li>• FastAPI Framework</li>
              <li>• Modular Routers</li>
              <li>• Secure Auth</li>
              <li>• RESTful API</li>
            </ul>
          </div>
          <div className="tech-card tech-database">
            <div className="tech-icon">🗄</div>
            <h3>Database</h3>
            <ul>
              <li>• PostgreSQL</li>
              <li>• Relational Schema</li>
              <li>• Foreign Keys</li>
              <li>• Transactions</li>
            </ul>
          </div>
          <div className="tech-card tech-infra">
            <div className="tech-icon">🌐</div>
            <h3>Infrastructure</h3>
            <ul>
              <li>• Docker Containers</li>
              <li>• AWS EC2</li>
              <li>• Nginx Reverse Proxy</li>
              <li>• SSH Management</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why This Platform Matters */}
      <section className="about-section">
        <h2>📈 Why This Platform Matters</h2>
        <p className="section-description">
          As EV adoption accelerates globally, infrastructure management becomes critical. This system addresses key challenges:
        </p>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-check">✓</div>
            <div>
              <h4>Reducing queue congestion</h4>
              <p>Intelligent slot management optimizes station utilization and minimizes wait times.</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-check">✓</div>
            <div>
              <h4>Improving operational efficiency</h4>
              <p>Automated workflows and real-time analytics drive operational excellence.</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-check">✓</div>
            <div>
              <h4>Enabling data-driven station expansion</h4>
              <p>Analytics guide strategic infrastructure investment and placement decisions.</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-check">✓</div>
            <div>
              <h4>Enhancing user convenience</h4>
              <p>Seamless booking and payment create a frictionless charging experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Scalability */}
      <section className="about-section">
        <h2>🔐 Security & Scalability</h2>
        <div className="security-grid">
          <div className="security-box">
            <h3>Security Features</h3>
            <ul>
              <li>🔒 Role-based access control (Admin / User separation)</li>
              <li>🔒 Secure password hashing</li>
              <li>🔒 Token-based authentication</li>
              <li>🔒 API validation and error handling</li>
            </ul>
          </div>
          <div className="scalability-box">
            <h3>Scalability</h3>
            <ul>
              <li>📈 Containerized deployment for horizontal scaling</li>
              <li>📈 Microservice-oriented architecture</li>
              <li>📈 Load balancing ready</li>
              <li>📈 Database optimization capabilities</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Developer Info */}
      <section className="about-section developer-section">
        <div className="developer-card">
          <h2>👨‍💻 Developed By</h2>
          <p className="developer-name">Mohammed Afnan S</p>
          <p className="developer-title">Full Stack Developer | Data Science & Cloud Enthusiast</p>
          <div className="developer-links">
            <a href="#" className="dev-link">Portfolio</a>
            <a href="#" className="dev-link">GitHub</a>
            <a href="#" className="dev-link">LinkedIn</a>
          </div>
        </div>
      </section>
    </div>
  );
}
