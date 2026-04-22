import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import "../styles/register-otp.css";

export default function RegisterOTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.phone) {
      setError(t("please_fill_all_fields"));
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError(t("invalid_phone"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      setSuccess(t("otp_sent_email"));
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err, t("send_otp")));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.otp || formData.otp.length !== 6) {
      setError(t("invalid_otp"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      setSuccess(t("otp_verified_set_password"));
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err, t("invalid_otp")));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError(t("password_min_6"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwords_not_match"));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/set-password", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("role", response.data.role || (response.data.user.is_admin ? "admin" : "user"));

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("authChanged"));

      setSuccess(t("account_created_success"));
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(getErrorMessage(err, t("create_account_btn")));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/resend-otp", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setSuccess(t("new_otp_sent"));
    } catch (err) {
      setError(getErrorMessage(err, t("resend_otp")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Back Button */}
        <div className="back-button-wrap">
          <button 
            type="button" 
            onClick={() => navigate("/")}
            className="back-link"
            title="Go back to home"
          >
            ← {t("back")}
          </button>
        </div>

        <div className="progress-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Info</span>
          </div>
          <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">OTP</span>
          </div>
          <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span className="step-number">3</span>
            <span className="step-label">{t("password")}</span>
          </div>
        </div>

        <h2>
          {step === 1 && t("register_title")}
          {step === 2 && t("verify_otp")}
          {step === 3 && t("set_password_title")}
        </h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>{t("full_name")}</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>{t("email_address")}</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>{t("phone_number")}</label>
              <input
                className="form-input"
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t("sending_otp") : t("send_otp")}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p className="subtitle">
              {t("otp_sent_email")} <strong>{formData.email}</strong>
            </p>

            <div className="form-group">
              <label>{t("enter_otp")}</label>
              <input
                className="form-input otp-input"
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                maxLength={6}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t("verifying") : t("verify_otp")}
            </button>

            <button type="button" className="btn-secondary" onClick={handleResendOTP} disabled={loading}>
              {t("resend_otp")}
            </button>

            <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>
              {t("back")}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSetPassword}>
            <p className="subtitle">{t("otp_verified_set_password")}</p>

            <div className="form-group">
              <label>{t("password")}</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Create password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>{t("confirm_password")}</label>
              <input
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t("creating_account") : t("create_account_btn")}
            </button>
          </form>
        )}

        <p className="link-text">
          {t("already_have_account")} <Link to="/login">{t("login_here")}</Link>
        </p>
      </div>
    </div>
  );
}
