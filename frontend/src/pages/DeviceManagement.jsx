import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import { useAuth } from "../context/AuthContext";

export default function DeviceManagement() {
  const navigate = useNavigate();
  const { logoutAllDevices } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError("");
      const refreshToken = localStorage.getItem("refresh_token");
      const headers = refreshToken ? { "X-Refresh-Token": refreshToken } : {};
      const res = await api.get("/auth/my-devices", { headers });
      setDevices(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load devices"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const revokeDevice = async (id) => {
    try {
      await api.delete(`/auth/revoke/${id}`);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to revoke device"));
    }
  };

  const revokeOthers = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        setError("Current device token not found");
        return;
      }
      await api.post("/auth/sessions/revoke-others", { refresh_token: refreshToken });
      await loadDevices();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to revoke other devices"));
    }
  };

  const forceLogoutAll = async () => {
    await logoutAllDevices();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">Active Devices</h1>
        <p className="text-gray-400 mb-6">Manage and revoke device sessions.</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={revokeOthers}
            className="px-3 py-2 rounded border border-amber-500/60 text-amber-300 hover:bg-amber-500/20"
          >
            Revoke Other Devices
          </button>
          <button
            onClick={forceLogoutAll}
            className="px-3 py-2 rounded border border-red-500/60 text-red-300 hover:bg-red-500/20"
          >
            Logout All Devices
          </button>
          <button
            onClick={loadDevices}
            className="px-3 py-2 rounded border border-slate-600 text-gray-200 hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="text-gray-300">Loading devices...</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!loading && devices.length === 0 && (
          <p className="text-gray-400">No active devices found.</p>
        )}

        <div className="space-y-3">
          {devices.map((d) => (
            <div key={d.id} className="p-4 rounded border border-slate-700 bg-slate-800/70 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{d.device_name || "Unknown device"}</p>
                <p className="text-sm text-gray-400">{d.ip_address || "Unknown IP"}</p>
                <p className="text-xs text-gray-500">
                  Created: {d.created_at ? new Date(d.created_at).toLocaleString() : "-"} | Last active:{" "}
                  {d.last_active ? new Date(d.last_active).toLocaleString() : "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {d.is_current && (
                  <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Current Device
                  </span>
                )}
                {!d.is_current && (
                  <button
                    onClick={() => revokeDevice(d.id)}
                    className="px-3 py-1 text-xs rounded border border-red-500/60 text-red-300 hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
