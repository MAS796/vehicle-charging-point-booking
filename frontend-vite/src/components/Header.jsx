import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">⚡ EV Charging</Link>
        </div>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            🏠 Home
          </Link>
          <Link
            to="/stations"
            className={`nav-link ${isActive("/stations") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            🔍 Find Stations
          </Link>
          <Link
            to="/network-map"
            className={`nav-link ${isActive("/network-map") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            🗺️ Network Map
          </Link>
          <Link
            to="/admin/login"
            className={`nav-link ${isActive("/admin/login") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            🔐 Admin
          </Link>
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      <style>{`
        .main-header {
          background: linear-gradient(90deg, #0066cc 0%, #0052a3 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5em;
          font-weight: bold;
        }

        .logo a {
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .logo a:hover {
          color: #00ccff;
        }

        .nav-menu {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 5px;
          transition: all 0.3s ease;
          font-size: 1em;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #00ccff;
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.3);
          color: #00ffff;
          border-bottom: 2px solid #00ccff;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5em;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #0052a3;
            flex-direction: column;
            gap: 0;
            padding: 20px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }

          .nav-menu.open {
            max-height: 300px;
          }

          .nav-link {
            padding: 12px;
            border-radius: 0;
            width: 100%;
            display: block;
          }

          .header-container {
            padding: 0 15px;
          }
        }
      `}</style>
    </header>
  );
}
