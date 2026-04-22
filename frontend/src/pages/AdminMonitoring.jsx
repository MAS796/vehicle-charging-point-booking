import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

function getWsUrl() {
  const base = import.meta.env.VITE_API_URL || window.location.origin;
  const wsBase = base.replace(/^http/i, "ws");
  return `${wsBase}/ws/audit`;
}

export default function AdminMonitoring() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const url = useMemo(() => getWsUrl(), []);

  useEffect(() => {
    let closed = false;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    let pingTimer = null;

    ws.onopen = () => {
      if (closed) return;
      setStatus("connected");
      // keepalive ping (helps with proxies / idle timeouts)
      const sendPing = () => {
        try {
          ws.send("ping");
        } catch (pingErr) {
          console.debug("WebSocket ping skipped:", pingErr);
        }
      };

      sendPing();
      pingTimer = setInterval(sendPing, 20000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [data, ...prev].slice(0, 100));
      } catch {
        // ignore non-json
      }
    };

    ws.onerror = () => {
      if (closed) return;
      setStatus("error");
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      if (closed) return;
      setStatus("disconnected");
      if (pingTimer) clearInterval(pingTimer);
    };

    return () => {
      closed = true;
      if (pingTimer) clearInterval(pingTimer);
      try {
        ws.close();
      } catch (closeErr) {
        console.debug("WebSocket close skipped:", closeErr);
      }
    };
  }, [url]);

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
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Admin Monitoring</h2>
            <p className="mt-1 text-sm text-slate-400">Real-time audit feed via WebSocket</p>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Status: </span>
            <span
              className={
                status === "connected"
                  ? "text-emerald-400"
                  : status === "connecting"
                    ? "text-amber-300"
                    : "text-red-300"
              }
            >
              {status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300">
            {getErrorMessage({ message: error })}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5">
          {logs.length === 0 ? (
            <p className="text-slate-400">No live events yet. Perform an admin action to see it here.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id || `${log.admin_id}-${log.timestamp}-${log.action}`} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p className="font-medium text-cyan-200">{log.action}</p>
                    <p className="text-xs text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Admin: #{log.admin_id} | Target: {log.target_user_id ?? "-"} | IP: {log.ip_address || "unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
