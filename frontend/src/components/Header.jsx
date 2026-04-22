import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import { useAuth } from "../context/AuthContext";
import "../styles/header.css";

function NavIcon({ name }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9.5V20h12V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "stations") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 21V6a2 2 0 012-2h4a2 2 0 012 2v15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9.5 8h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13 13h2.5l-1.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "nearby") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "network") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="6" cy="8" r="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="8" r="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="16" r="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 9.2l2.7 4.3M16 9.2l-2.7 4.3M8 8h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "about") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 11.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "companies") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 21V6a1 1 0 011-1h7a1 1 0 011 1v15" stroke="currentColor" strokeWidth="1.8" />
        <path d="M13 21v-9a1 1 0 011-1h5a1 1 0 011 1v9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "contact") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

export default function Header() {
  const { t } = useTranslation();
  const { user, getRole, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const pathname = location.pathname || "/";
  const isRouteMatch = (patterns) => {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    return list.some((pattern) => {
      if (!pattern) {
        return false;
      }
      if (pattern === "/") {
        return pathname === "/" || pathname === "/home";
      }
      return pathname === pattern || pathname.startsWith(`${pattern}/`);
    });
  };
  const isLoggedIn = Boolean(user);
  const role = (isLoggedIn ? getRole() : "").toLowerCase();
  const isAdmin = isLoggedIn && (user?.is_admin === true || role === "admin");
  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const primaryLinks = [
    { to: "/", key: "home", icon: "home", emoji: "⌂", match: ["/", "/home"] },
    { to: "/stations", key: "find_stations", icon: "stations", emoji: "⚡", match: ["/stations", "/station", "/payment", "/bookings"] },
    { to: "/nearby-stations", key: "nearby", icon: "nearby", emoji: "◎", match: ["/nearby-stations", "/station-map"] },
    { to: "/network-map", key: "network_map", icon: "network", emoji: "◈", match: ["/network-map", "/network"] },
    { to: "/about", key: "about", icon: "about", emoji: "i", match: "/about" },
    { to: "/companies", key: "companies", icon: "companies", emoji: "▦", match: ["/companies", "/company", "/owner"] },
    { to: "/contact", key: "contact", icon: "contact", emoji: "✉", match: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-wrap">
          <Link to="/" className="logo-link" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon" aria-hidden="true">
              <span className="logo-fallback">⚡</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 2L5 13h5l-1 9 10-13h-6l1-7z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="logo-text">EV Charge Pro</span>
          </Link>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <div className="nav-primary">
            {primaryLinks.map((item, idx) => (
              <React.Fragment key={item.to}>
                <Link
                  to={item.to}
                  data-icon={item.emoji}
                  className={`nav-link ${isRouteMatch(item.match || item.to) ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="nav-link-content">
                    <span className="nav-link-emoji" aria-hidden="true">{item.emoji}</span>
                    <span className="nav-link-icon">
                      <NavIcon name={item.icon} />
                    </span>
                    <span>{t(item.key)}</span>
                  </span>
                </Link>
                {idx !== primaryLinks.length - 1 && <span className="pipe">|</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="nav-right">
            {isLoggedIn ? (
              <div className="user-box">
                <div className="user-avatar">{initials}</div>
                <div className="user-meta">
                  <p className="user-name">{displayName}</p>
                  <div className="user-links">
                    <Link
                      to="/dashboard"
                      className={`sub-link ${isRouteMatch("/dashboard") ? "active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("dashboard")}
                    </Link>
                    {isAdmin && (
                      <>
                        <span className="sub-pipe">|</span>
                        <Link
                          to="/admin/dashboard"
                          className={`sub-link ${isRouteMatch(["/admin", "/admin/dashboard", "/admin/security", "/admin/monitoring"]) ? "active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {t("admin")}
                        </Link>
                      </>
                    )}
                    <span className="sub-pipe">|</span>
                    <button type="button" onClick={handleLogout} className="sub-link logout-inline">
                      {t("logout")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="guest-links">
                <Link
                  to="/login"
                  className={`nav-link ${isRouteMatch("/login") ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t("login")}
                </Link>
                <span className="pipe">|</span>
                <Link
                  to="/register"
                  className={`nav-link ${isRouteMatch("/register") ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t("register")}
                </Link>
                <span className="pipe">|</span>
                <Link
                  to="/admin/login"
                  className={`nav-link ${isRouteMatch("/admin/login") ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t("admin")}
                </Link>
              </div>
            )}

            <div className="lang-wrap">
              <LanguageSelector compact />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
