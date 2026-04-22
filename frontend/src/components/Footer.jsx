import React from "react";

export default function Footer() {
  return (
    <footer className="support-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🆘 Support</h3>
          <p>24/7 Customer Support</p>
          <a href="tel:19001110000" className="footer-link">
            1900-111-0000
          </a>
        </div>
        <div className="footer-section">
          <h3>🚙 Partner Network</h3>
          <p>Integrated with major EV platforms and partners</p>
          <p className="partners-list">• • </p>
        </div>
        <div className="footer-section">
          <h3>📱 Mobile App</h3>
          <p>Download our app for better experience and real-time updates</p>
          <div className="app-buttons">
            <button>iOS App</button>
            <button>Android App</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 EV Charging Network. All rights reserved.</p>
        <p className="legal-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <span>|</span>
          <a href="/terms">Terms of Service</a>
        </p>
      </div>

      <style>{`
        .support-footer {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 60px 20px 20px;
          margin-top: 60px;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h3 {
          font-size: 1.3em;
          margin-bottom: 10px;
          margin-top: 0;
        }

        .footer-section p {
          color: #ccc;
          margin-bottom: 10px;
          margin-top: 5px;
        }

        .footer-link {
          color: #0099ff;
          text-decoration: none;
          font-weight: bold;
          transition: color 0.3s ease;
          display: inline-block;
        }

        .footer-link:hover {
          color: #00ccff;
        }

        .partners-list {
          color: #aaa;
          font-size: 0.95em;
        }

        .app-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .app-buttons button {
          padding: 8px 16px;
          background: #0099ff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          font-size: 0.9em;
        }

        .app-buttons button:hover {
          background: #00ccff;
          transform: translateY(-2px);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #999;
        }

        .footer-bottom p {
          margin: 0;
        }

        .legal-links {
          margin-top: 10px;
          display: flex;
          justify-content: center;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .legal-links a {
          color: #7dd3fc;
          text-decoration: underline;
        }

        .legal-links a:hover {
          color: #38bdf8;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .app-buttons {
            flex-direction: column;
          }

          .app-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </footer>
  );
}
