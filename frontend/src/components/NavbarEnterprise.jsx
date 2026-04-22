import React from "react";
import "../styles/navbar-enterprise.css";

const NavbarEnterprise = () => {
  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <div className="logo">EV Smart</div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="#features">Features</a>
        </div>
      </div>
    </nav>
  );
};

export default NavbarEnterprise;
