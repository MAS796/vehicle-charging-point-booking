import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function SOCDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/soc/summary");
        setData(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            <span aria-hidden>←</span>
            Back to Admin
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Security Operations Center</h1>
        <p className="mt-2 text-sm text-slate-400">
          Zero-trust monitoring, risk posture, and security alerts
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300">
            {error}
          </div>
        )}

        {loading || !data ? (
          <p className="mt-6 text-slate-300">Loading SOC summary...</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <p className="text-sm text-slate-400">High Risk Admins</p>
                <p className="mt-2 text-3xl font-bold text-amber-300">{data.high_risk_admin_accounts}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <p className="text-sm text-slate-400">Frozen Accounts</p>
                <p className="mt-2 text-3xl font-bold text-red-300">{data.frozen_accounts}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <p className="text-sm text-slate-400">Deleted Accounts</p>
                <p className="mt-2 text-3xl font-bold text-slate-200">{data.deleted_accounts}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <p className="text-sm text-slate-400">Active Sessions (24h)</p>
                <p className="mt-2 text-3xl font-bold text-emerald-300">{data.active_sessions_last_24h}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Security Alerts (24h)</h2>
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200">
                  {data.security_alerts_last_24h}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-300">Top IPs (24h)</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {(data.top_ips_last_24h || []).map((row) => (
                    <div key={row.ip} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/30 px-3 py-2">
                      <span className="text-sm text-slate-200">{row.ip}</span>
                      <span className="text-xs text-slate-400">{row.count} events</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
