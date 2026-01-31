import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import "../styles/admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if regular user is already logged in - if so, redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      // User is logged in, redirect to home
      navigate("/");
    }
  }, [navigate]);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      // Check if user is admin
      if (!res.data.user.is_admin) {
        alert("Invalid credentials. Only admins can login here.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("role", "admin");

      window.location.href = "/admin";
    } catch (err) {
      const errorMsg = getErrorMessage(err, "Admin login failed");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Icon */}
        <div className="admin-icon">👥</div>

        {/* Title */}
        <h1 className="admin-title">Admin Login</h1>
        <p className="admin-subtitle">Access the admin control panel</p>

        {error && <div className="error-message">{error}</div>}

        {/* Email Field */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Login Button */}
        <button
          className="login-btn"
          onClick={handleAdminLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>

        {/* Help Text */}
        <p className="help-text">Contact your administrator for login credentials</p>

        {/* Security Notice */}
        <div className="security-notice">
          <span className="lock-icon">🔒</span>
          <span>This is a secure admin portal. Authorized personnel only.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
