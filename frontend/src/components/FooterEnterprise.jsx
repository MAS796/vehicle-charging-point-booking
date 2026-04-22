import React from "react";
import "../styles/footer-enterprise.css";

const FooterEnterprise = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>EV Smart</h4>
          <p>Enterprise EV Charging Management Platform</p>
        </div>

        <div>
          <h4>Platform</h4>
          <p>Dashboard</p>
          <p>Analytics</p>
          <p>Admin</p>
        </div>

        <div>
          <h4>Company</h4>
          <p>About</p>
          <p>Contact</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 EV Smart. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterEnterprise;
