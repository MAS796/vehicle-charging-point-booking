import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/header.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check user on mount and when location changes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  // Listen for storage changes (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="header">
      <h2>⚡ EV Charging</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/network-map">🗺️ Network Map</Link>
        <Link to="/companies">Companies</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/about">About</Link>
        <Link to="/admin-login">Admin</Link>
        
        {user ? (
          <div className="user-menu">
            <Link to="/dashboard" className="dashboard-link">📊 Dashboard</Link>
            <span>Hi, {user.name}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="login-link">
              Login
            </Link>
            <Link to="/register" className="register-link">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
