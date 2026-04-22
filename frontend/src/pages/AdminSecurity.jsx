import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function AdminSecurity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/audit-logs");
      const payload = res.data;
      setLogs(Array.isArray(payload) ? payload : payload?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            <span aria-hidden>←</span>
            Back to Admin
          </Link>
        </div>
        <h2 className="text-2xl font-bold">Admin Activity Timeline</h2>
        <p className="mt-2 text-sm text-slate-400">Recent admin actions with IP tracking</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5">
          {loading ? (
            <p className="text-slate-300">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-slate-400">No logs found.</p>
          ) : (
            <div className="ml-2 border-l-2 border-emerald-500/70 pl-5">
              {logs.map((log) => (
                <div key={log.id} className="relative mb-6">
                  <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald-500" />
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-slate-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                  </p>
                  <p className="text-xs text-slate-400">IP: {log.ip_address || "unknown"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
