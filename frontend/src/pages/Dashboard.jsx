import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import AIInsights from "../components/AIInsights";
import AIChat from "../components/AIChat";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logoutAllDevices } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [baseRes, enterpriseRes] = await Promise.all([
        api.get(`/analytics/dashboard?days=${days}`),
        api.get("/analytics/enterprise-dashboard"),
      ]);
      setStats({
        ...baseRes.data,
        enterprise: enterpriseRes.data,
        generated_at: enterpriseRes.data?.generated_at || baseRes.data?.generated_at,
      });
    } catch (err) {
      setError("Failed to load dashboard: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // 5 min auto-refresh
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      setSessionError("");
      const refreshToken = localStorage.getItem("refresh_token");
      const headers = refreshToken ? { "X-Refresh-Token": refreshToken } : {};
      const res = await api.get("/auth/sessions", { headers });
      setSessions(res.data || []);
    } catch (err) {
      setSessionError("Failed to load sessions: " + getErrorMessage(err));
    } finally {
      setSessionsLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await api.post(`/auth/sessions/${sessionId}/revoke`);
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, is_revoked: true } : session
        )
      );
    } catch (err) {
      setSessionError("Failed to revoke session: " + getErrorMessage(err));
    }
  };

  const revokeOtherDevices = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        setSessionError("Current device session token not found.");
        return;
      }

      await api.post("/auth/sessions/revoke-others", {
        refresh_token: refreshToken,
      });
      await fetchSessions();
    } catch (err) {
      setSessionError("Failed to revoke other sessions: " + getErrorMessage(err));
    }
  };

  const forceLogoutAllDevices = async () => {
    try {
      await logoutAllDevices();
    } finally {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">No data available</p>
      </div>
    );
  }

  const chargingTypeData = [
    { name: "AC Chargers", value: stats.ac_bookings || 0 },
    { name: "DC Chargers", value: stats.dc_bookings || 0 }
  ];
  const dailyRevenueSeries = stats.enterprise?.daily_revenue || [];
  const monthlyRevenueSeries = stats.enterprise?.monthly_trend || [];

  const COLORS = ["#06b6d4", "#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-cyan-400">{t("analytics_dashboard")}</h1>
        <p className="text-gray-400 mb-8">{t("real_time_insights")}</p>
        {stats?.generated_at && (
          <p className="text-xs text-gray-500 mb-4">
            Last updated: {new Date(stats.generated_at).toLocaleString()}
          </p>
        )}
        <Link to="/devices" className="inline-block mb-8 text-cyan-300 hover:text-cyan-200 underline">
          Open full device management
        </Link>

        {/* Time Period Selector */}
        <div className="mb-8">
          <label className="text-gray-300 mr-3">Time Period:</label>
          <select 
            value={days} 
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 1 year</option>
          </select>
        </div>

        {/* Device Sessions */}
        <div className="mb-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-300">Device Sessions</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={forceLogoutAllDevices}
                className="px-3 py-1 text-sm rounded border border-red-500/60 text-red-300 hover:bg-red-500/20"
              >
                Logout All Devices
              </button>
              <button
                onClick={revokeOtherDevices}
                className="px-3 py-1 text-sm rounded border border-amber-500/60 text-amber-300 hover:bg-amber-500/20"
              >
                Revoke Other Devices
              </button>
              <button
                onClick={fetchSessions}
                className="px-3 py-1 text-sm rounded border border-slate-600 text-gray-200 hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {sessionsLoading && <p className="text-gray-400">Loading sessions...</p>}
          {sessionError && <p className="text-red-400 mb-3">{sessionError}</p>}

          {!sessionsLoading && sessions.length === 0 && (
            <p className="text-gray-400">No active sessions found.</p>
          )}

          {sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/60"
                >
                  <div>
                    <p className="text-white text-sm">{session.device_name || session.device_info || "Unknown device"}</p>
                    <p className="text-xs text-gray-400">{session.ip_address || "Unknown IP"}</p>
                    <p className="text-xs text-gray-400">
                      Created: {session.created_at ? new Date(session.created_at).toLocaleString() : "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last active: {session.last_active ? new Date(session.last_active).toLocaleString() : "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.is_current && (
                      <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Current Device
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        session.is_revoked
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {session.is_revoked ? "Revoked" : "Active"}
                    </span>
                    {!session.is_revoked && (
                      <button
                        onClick={() => revokeSession(session.id)}
                        disabled={session.is_current}
                        className="px-3 py-1 text-xs rounded border border-red-500/60 text-red-300 hover:bg-red-500/20"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-xl p-5">
            <p className="text-indigo-300 text-sm">Today Bookings</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.daily?.bookings || stats.enterprise?.usage_stats?.bookings_today || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-5">
            <p className="text-emerald-300 text-sm">Today Revenue</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.daily?.revenue || stats.enterprise?.kpis?.today_revenue || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-xl p-5">
            <p className="text-violet-300 text-sm">Booking Growth</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.enterprise?.kpis?.booking_growth_percent || 0}%</p>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/30 rounded-xl p-5">
            <p className="text-sky-300 text-sm">Active Users Today</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.enterprise?.kpis?.active_users_today || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-5">
            <p className="text-amber-300 text-sm">Peak Hour</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.enterprise?.kpis?.peak_hour_label || "-"}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5">
            <p className="text-cyan-300 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total_bookings || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-5">
            <p className="text-green-300 text-sm">Total Companies</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total_companies || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5">
            <p className="text-purple-300 text-sm">Total Views</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total_views || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-5">
            <p className="text-yellow-300 text-sm">AC Bookings</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.ac_bookings || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 rounded-xl p-5">
            <p className="text-rose-300 text-sm">Usage Rate</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.enterprise?.kpis?.charger_usage_rate_percent || 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Revenue Trend */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Daily Revenue (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Monthly Revenue (12M)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="revenue" fill="#38bdf8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">AC vs DC Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chargingTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chargingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Top Companies */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Top Companies by Views</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_companies || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="views" fill="#06b6d4" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Top Companies</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {(stats.top_companies || []).map((company) => (
                  <tr key={company.id} className="border-b border-slate-700/50">
                    <td className="py-3 text-white">{company.name}</td>
                    <td className="py-3 text-cyan-400">{company.views}</td>
                    <td className="py-3 text-green-400">{company.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-cyan-300">Country Distribution</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-slate-700">
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Companies</th>
                </tr>
              </thead>
              <tbody>
                {(stats.country_distribution || []).map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50">
                    <td className="py-3 text-white">{item.country}</td>
                    <td className="py-3 text-cyan-400">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Features */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <AIInsights />
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  );
}


