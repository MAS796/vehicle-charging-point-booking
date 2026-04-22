import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import adminBg from "../assets/admin-bg.jpg";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/error";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pending2FA, setPending2FA] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", {
        email: normalizedEmail,
        password,
      });

      if (res.data?.["2fa_required"]) {
        setPending2FA(true);
        setChallengeToken(res.data.challenge_token || "");
        setOtp("");
        setError("Enter the OTP sent to your email.");
        return;
      }

      if (!res.data?.user?.is_admin) {
        setError("Invalid credentials. Only admins can login here.");
        return;
      }

      login(res.data);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("authChanged"));

      navigate("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Admin login failed"));
    } finally {
      setLoading(false);
    }
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

      if (!res.data?.user?.is_admin) {
        setError("Invalid credentials. Only admins can login here.");
        return;
      }

      login(res.data);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("authChanged"));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 py-8"
      style={{
        backgroundImage: `url(${adminBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-600 opacity-20 blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-600 opacity-20 blur-3xl mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-2 text-center">
            <div className="inline-block rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-3">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Admin Login</h2>
            <p className="text-sm text-gray-300">Access the admin control panel</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3">
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          )}

          {!pending2FA ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white transition duration-300 hover:opacity-90 hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">2FA OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OTP"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white transition duration-300 hover:opacity-90 hover:scale-105 disabled:opacity-50"
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
                className="w-full rounded-lg border border-white/30 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Back to Admin Login
              </button>
            </form>
          )}

          <div className="border-t border-white/10 pt-4">
            <p className="text-center text-sm text-gray-400">
              Contact your administrator for login credentials
            </p>
            <p className="mt-2 text-center text-sm text-gray-300">
              User account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-300 hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-center">
          <p className="text-xs text-blue-300">
            This is a secure admin portal. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
