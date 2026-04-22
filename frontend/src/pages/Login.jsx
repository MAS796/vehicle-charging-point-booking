import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [pending2FA, setPending2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const getLandingRoute = useCallback((roleValue) => {
    const role = (roleValue || "").toLowerCase();
    if (role === "admin") {
      return "/admin";
    }
    if (role === "station_owner") {
      return "/owner/dashboard";
    }
    return "/home";
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (user && token) {
      navigate(getLandingRoute(role));
    }
  }, [navigate, getLandingRoute]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError(t("please_enter_email_password"));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: normalizedEmail,
        password,
        device_name: navigator.userAgent,
      });

      if (res.data?.["2fa_required"]) {
        setPending2FA(true);
        setChallengeToken(res.data.challenge_token || "");
        setOtp("");
        setError("Enter the OTP sent to your email.");
        return;
      }

      if (res.data?.user?.is_admin) {
        setError("Admin account detected. Please use the admin login page.");
        return;
      }

      completeLogin(res.data);
    } catch (err) {
      setError(getErrorMessage(err, t("invalid_email_password")));
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data) => {
    localStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("email", data.user.email);
    const role = data.role || (data.user?.is_admin ? "admin" : "user");
    localStorage.setItem("role", role);

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("authChanged"));
    navigate(getLandingRoute(role));
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || !challengeToken) {
      setError("OTP is required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/2fa/verify", {
        challenge_token: challengeToken,
        otp,
      });
      completeLogin(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        setError("Google login failed");
        return;
      }

      const res = await api.post("/auth/google-login", { token });

      completeLogin(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Google login failed"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-cyan-500/30">
        <h1 className="text-3xl font-bold text-white text-center mb-2">{t("login_title")}</h1>
        <p className="text-gray-400 text-center mb-8">{t("login_subtitle")}</p>

        {!pending2FA ? (
        <form onSubmit={handleLogin}>
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">{t("email_address")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-2">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
          >
            {loading ? t("logging_in") : t("login")}
          </button>

          {googleEnabled && (
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed")}
              />
            </div>
          )}

          <p className="text-center text-gray-400 mt-6">
            {t("new_user")}{" "}
            <Link to="/register" className="text-cyan-400 hover:underline">
              {t("create_account")}
            </Link>
          </p>
        </form>
        ) : (
        <form onSubmit={handleVerify2FA}>
          {error && (
            <div className="mb-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">2FA OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPending2FA(false);
              setChallengeToken("");
              setOtp("");
              setError("");
            }}
            className="w-full mt-3 py-2 border border-slate-600 rounded-lg text-gray-200 hover:bg-slate-700 transition"
          >
            Back to Login
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
