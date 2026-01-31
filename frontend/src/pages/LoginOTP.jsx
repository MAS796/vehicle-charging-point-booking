import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import "../styles/login-otp.css";

const LoginOTP = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("initial"); // initial, phone, otp, welcome
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      navigate("/");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/request-otp", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp) {
      setError("Please enter OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: otp,
      });

      // Save authentication data
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("email", res.data.user.email);

      // Show welcome screen
      setStep("welcome");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/request-otp", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      setOtp("");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Phone & User Info
  if (step === "initial" || step === "phone") {
    return (
      <div className="login-container">
        <div className="login-card">
          {step === "otp" || step === "welcome" ? (
            <button className="back-btn" onClick={() => setStep("phone")}>
              ←
            </button>
          ) : null}

          {/* Phone Icon */}
          <div className="phone-icon">📱</div>

          <h2>user login</h2>
          <p className="subtitle">
            Enter your details for verification
          </p>

          <form onSubmit={handleRequestOTP} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone number for verification</label>
              <div className="phone-input">
                <span className="country-code">🇮🇳 +91</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <p className="help-text">
                This number will be used for all ride-related communication
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <p className="agreement">
              I agree to share my Personally Identifiable Information like name,
              Email, Mobile number etc. I agree to the Terms of Services and
              Privacy Policy of this app.
            </p>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === "otp") {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={() => setStep("phone")}>
            ←
          </button>

          {/* OTP Icon */}
          <div className="otp-icon">✓</div>

          <h2>Login</h2>
          <p className="subtitle">Enter new OTP</p>

          <form onSubmit={handleVerifyOTP} className="login-form">
            <p className="otp-sent">
              Code has been sent to
              <br />
              <strong>{formData.email}</strong>
            </p>

            <div className="otp-inputs">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="otp-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="button" className="resend-btn" onClick={handleResendOTP}>
              Resend code?
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Verifying..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Welcome Screen
  if (step === "welcome") {
    return (
      <div className="login-container">
        <div className="welcome-card">
          {/* City Illustration */}
          <div className="city-illustration">
            🏙️
          </div>

          <h2>Explore new way to travel with EV Charging</h2>
          <p className="welcome-text">
            Enjoy a smooth app experience by giving us your location and phone
            access. This is for better route suggestions and account
            verification.
          </p>

          <button className="continue-btn" onClick={() => navigate("/")}>
            Continue with phone number
          </button>

          <div className="divider">OR</div>

          <div className="social-login">
            <button className="social-btn facebook">
              <span>f</span> With Facebook
            </button>
            <button className="social-btn google">
              <span>G</span> With Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginOTP;
