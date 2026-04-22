import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function Register() {
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
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill all fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setSuccess("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      setSuccess("OTP verified! Now set your password.");
      setStep(3);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/set-password", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("email", response.data.user.email);
      window.dispatchEvent(new Event("storage"));

      setSuccess("Account created successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create account"));
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
      setSuccess("New OTP sent to your email!");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-cyan-500/30">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? "text-cyan-400" : "text-gray-500"}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-cyan-500 text-white" : "bg-slate-700"}`}>1</span>
            <span className="ml-2 text-sm hidden sm:inline">Info</span>
          </div>
          <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
          <div className={`flex items-center ${step >= 2 ? "text-cyan-400" : "text-gray-500"}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-cyan-500 text-white" : "bg-slate-700"}`}>2</span>
            <span className="ml-2 text-sm hidden sm:inline">OTP</span>
          </div>
          <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
          <div className={`flex items-center ${step >= 3 ? "text-cyan-400" : "text-gray-500"}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? "bg-cyan-500 text-white" : "bg-slate-700"}`}>3</span>
            <span className="ml-2 text-sm hidden sm:inline">Password</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {step === 1 && "Create Account"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Set Password"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Info */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-gray-400 text-center mb-4">
              We've sent a 6-digit OTP to <strong className="text-cyan-400">{formData.email}</strong>
            </p>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Enter OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                maxLength={6}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-xl tracking-widest focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="flex-1 py-2 bg-slate-700 rounded-lg text-cyan-400 hover:bg-slate-600 transition"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 py-2 bg-slate-700 rounded-lg text-gray-400 hover:bg-slate-600 transition"
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <p className="text-gray-400 text-center mb-4">
              Email verified! Now create a secure password.
            </p>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
