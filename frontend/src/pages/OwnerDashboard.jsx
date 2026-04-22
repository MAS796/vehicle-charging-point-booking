import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/owners/me/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load owner summary:", err);
        setError("Unable to load owner dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const ownerName = summary?.owner?.name || user?.name || "Station Owner";
  const revenue = Number(summary?.revenue || 0).toLocaleString();

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Station Owner Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome, {ownerName}</p>
          </div>
          <Link
            to="/network-map"
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition"
          >
            Open Station Map
          </Link>
        </div>

        {loading ? <p className="text-slate-600">Loading dashboard...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">Rs. {revenue}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Active Stations</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{summary.active_stations || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Bookings</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{summary.bookings || 0}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
