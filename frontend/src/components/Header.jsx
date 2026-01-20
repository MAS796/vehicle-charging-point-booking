import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/header.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="header">
      <h2>⚡ EV Charging</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/admin">Admin</Link>
        
        {user ? (
          <div className="user-menu">
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
