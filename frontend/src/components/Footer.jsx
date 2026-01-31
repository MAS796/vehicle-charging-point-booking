import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer support-footer">
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
          <p>Designed to support leading EV manufacturers</p>
<p className="partners-list">
Compatible with major EV ecosystems and charging standards
</p>
</div>
        <div className="footer-section">
          <h3>📱 Mobile App</h3>
          <p>Download our app for better experience and real-time updates</p>
          <div className="app-buttons">
            <button>iOS App(nun)</button>
            <button>Android App(nun)</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 EV Charging Network. All rights reserved.</p>
      </div>
    </footer>
  );
}
