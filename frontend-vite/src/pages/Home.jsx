import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>⚡ Welcome to EV Charging Network</h1>
          <p>Find, Book & Charge Your Electric Vehicle Anytime, Anywhere</p>
          <div className="hero-buttons">
            <Link to="/stations" className="btn btn-primary">
              🔍 Find Stations Now
            </Link>
            <Link to="/network-map" className="btn btn-secondary">
              🗺️ View Network Map
            </Link>
          </div>
        </div>
        <div className="hero-bg"></div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature">
            <span className="icon">⚡</span>
            <h3>Fast Charging</h3>
            <p>50kW to 150kW charging speeds for quick top-ups</p>
          </div>
          <div className="feature">
            <span className="icon">🗺️</span>
            <h3>Pan India Network</h3>
            <p>1000+ stations across major cities and highways</p>
          </div>
          <div className="feature">
            <span className="icon">📱</span>
            <h3>Real-time Updates</h3>
            <p>Live availability and station status tracking</p>
          </div>
          <div className="feature">
            <span className="icon">🆘</span>
            <h3>24/7 Support</h3>
            <p>Emergency assistance available round the clock</p>
          </div>
          <div className="feature">
            <span className="icon">💳</span>
            <h3>Easy Payments</h3>
            <p>Multiple payment options for your convenience</p>
          </div>
          <div className="feature">
            <span className="icon">🏆</span>
            <h3>Best Prices</h3>
            <p>Competitive rates and special discounts for members</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat">
          <h3>1000+</h3>
          <p>Charging Stations</p>
        </div>
        <div className="stat">
          <h3>50K+</h3>
          <p>Daily Users</p>
        </div>
        <div className="stat">
          <h3>150kW</h3>
          <p>Max Charging Speed</p>
        </div>
        <div className="stat">
          <h3>24/7</h3>
          <p>Support Available</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Ready to Charge Your EV?</h2>
        <p>Join thousands of happy EV owners using our network</p>
        <Link to="/stations" className="btn btn-large">
          Start Booking Now →
        </Link>
      </section>

      <style>{`
        .home-container {
          min-height: 100vh;
          background: white;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          color: white;
          padding: 100px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero h1 {
          font-size: 3.5em;
          margin: 0 0 20px 0;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero p {
          font-size: 1.5em;
          margin: 0 0 40px 0;
          color: #e0e0ff;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Buttons */
        .btn {
          padding: 15px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1em;
          transition: all 0.3s ease;
          display: inline-block;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: white;
          color: #0066cc;
        }

        .btn-primary:hover {
          background: #f0f0f0;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #0066cc;
          transform: translateY(-3px);
        }

        .btn-large {
          padding: 18px 50px;
          font-size: 1.2em;
        }

        /* Features Section */
        .features {
          padding: 80px 20px;
          background: #f5f5f5;
        }

        .features h2 {
          text-align: center;
          font-size: 2.5em;
          margin-bottom: 60px;
          color: #333;
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature {
          background: white;
          padding: 40px 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .feature:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .feature .icon {
          font-size: 3em;
          display: block;
          margin-bottom: 20px;
        }

        .feature h3 {
          font-size: 1.3em;
          color: #333;
          margin: 0 0 15px 0;
        }

        .feature p {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        /* Stats Section */
        .stats {
          padding: 80px 20px;
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          color: white;
        }

        .stats {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          text-align: center;
        }

        .stat h3 {
          font-size: 3em;
          margin: 0 0 10px 0;
        }

        .stat p {
          margin: 0;
          color: #e0e0ff;
        }

        /* CTA Section */
        .cta {
          padding: 80px 20px;
          text-align: center;
          background: white;
        }

        .cta h2 {
          font-size: 2.5em;
          color: #333;
          margin: 0 0 20px 0;
        }

        .cta p {
          font-size: 1.2em;
          color: #666;
          margin: 0 0 40px 0;
        }

        @media (max-width: 768px) {
          .hero {
            padding: 60px 20px;
          }

          .hero h1 {
            font-size: 2em;
          }

          .hero p {
            font-size: 1.2em;
          }

          .features h2 {
            font-size: 1.8em;
          }

          .cta h2 {
            font-size: 1.8em;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
