import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    totalStations: 0,
    activeBookings: 0,
    registeredUsers: 0,
    totalRevenue: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [adminLogs, setAdminLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissionCatalog, setPermissionCatalog] = useState([]);
  const [myPermissions, setMyPermissions] = useState({ is_super_admin: false, permissions: [] });
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [companies, setCompanies] = useState([]);
  const [payoutEdits, setPayoutEdits] = useState({});
  const [userListMode, setUserListMode] = useState("active"); // active | trash | all
  const [userActionLoadingId, setUserActionLoadingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Station form
  const [stationForm, setStationForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    available_slots: 5,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!storedUser || role !== "admin") {
      navigate("/admin/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    setError("");
    if (user) {
      if (activeTab === "overview") {
        fetchOverviewStats();
      } else if (activeTab === "analytics") {
        fetchOverviewStats();
      } else if (activeTab === "stations") {
        fetchStations();
      } else if (activeTab === "bookings") {
        fetchBookings();
      } else if (activeTab === "audit-logs") {
        fetchAdminLogs();
      } else if (activeTab === "users") {
        fetchUsersData();
      } else if (activeTab === "payouts") {
        fetchPayoutCompanies();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user, userListMode]);

  const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");

  const formatRevenue = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const isActiveBooking = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    return !["completed", "cancelled", "canceled", "failed", "refunded", "expired"].includes(status);
  };

  const isPaidBooking = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    const paymentStatus = String(booking?.payment_status || booking?.payment?.status || "").toLowerCase();
    return (
      ["completed", "paid", "success", "successful"].includes(status) ||
      ["completed", "paid", "success", "successful", "captured"].includes(paymentStatus)
    );
  };

  const getBookingAmount = (booking) => {
    const rawAmount =
      booking?.amount ??
      booking?.total_amount ??
      booking?.payment_amount ??
      booking?.paid_amount ??
      booking?.price ??
      booking?.fare ??
      booking?.payment?.amount ??
      (booking?.hours ? Number(booking.hours) * 60 : 0);
    const amount = Number(rawAmount);
    return Number.isFinite(amount) ? amount : 0;
  };

  const getBookingDate = (booking) => {
    const dateFields = [
      booking?.created_at,
      booking?.createdAt,
      booking?.booking_date,
      booking?.bookingDate,
      booking?.date,
      booking?.start_time,
      booking?.startTime,
      booking?.slot_time,
      booking?.updated_at,
    ];

    for (const value of dateFields) {
      if (!value) continue;
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  };

  const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const countBookingsBetween = (items, start, end) =>
    items.filter(({ date }) => date >= start && date < end).length;

  const getTrend = (current, previous) => {
    if (previous === 0) {
      return {
        current,
        previous,
        changeLabel: current === 0 ? "0%" : "New",
        tone: current === 0 ? "text-gray-400" : "text-cyan-400",
      };
    }

    const change = Math.round(((current - previous) / previous) * 100);
    return {
      current,
      previous,
      changeLabel: `${change >= 0 ? "+" : ""}${change}%`,
      tone: change >= 0 ? "text-green-400" : "text-red-400",
    };
  };

  const getStationKey = (booking) =>
    booking?.station_id ??
    booking?.stationId ??
    booking?.station?.id ??
    booking?.station_name ??
    booking?.station?.name ??
    null;

  const fetchOverviewStats = async () => {
    setOverviewLoading(true);
    setError("");

    const [stationsResult, bookingsResult, usersResult] = await Promise.allSettled([
      api.get("/stations/"),
      api.get("/bookings/"),
      api.get("/admin/users"),
    ]);

    const nextStations = stationsResult.status === "fulfilled" ? stationsResult.value.data || [] : [];
    const nextBookings = bookingsResult.status === "fulfilled" ? bookingsResult.value.data || [] : [];
    const nextUsers = usersResult.status === "fulfilled" ? usersResult.value.data || [] : [];

    setStations(nextStations);
    setBookings(nextBookings);
    setUsers(nextUsers);
    setOverviewStats({
      totalStations: nextStations.length,
      activeBookings: nextBookings.filter(isActiveBooking).length,
      registeredUsers: nextUsers.length,
      totalRevenue: nextBookings
        .filter(isPaidBooking)
        .reduce((sum, booking) => sum + getBookingAmount(booking), 0),
    });

    const failedRequest = [stationsResult, bookingsResult, usersResult].find(
      (result) => result.status === "rejected"
    );
    if (failedRequest) {
      setError(getErrorMessage(failedRequest.reason, "Some dashboard metrics could not be loaded"));
    }

    setOverviewLoading(false);
  };

  const fetchStations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/stations/");
      setStations(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/");
      setBookings(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/logs");
      setAdminLogs(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersData = async () => {
    setLoading(true);
    setError("");
    try {
      const params =
        userListMode === "trash"
          ? { only_deleted: true }
          : userListMode === "all"
            ? { include_deleted: true }
            : {};
      const [usersRes, meRes, catalogRes] = await Promise.all([
        api.get("/admin/users", { params }),
        api.get("/admin/me/permissions"),
        api.get("/admin/permissions/catalog"),
      ]);
      const fetchedUsers = usersRes.data || [];
      setUsers(fetchedUsers);
      setMyPermissions(meRes.data || { is_super_admin: false, permissions: [] });
      setPermissionCatalog(catalogRes.data?.permissions || []);

      const nextSelected = {};
      fetchedUsers.forEach((u) => {
        nextSelected[u.id] = [];
      });
      setSelectedPermissions(nextSelected);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/companies");
      const list = res.data || [];
      setCompanies(list);
      const next = {};
      list.forEach((c) => {
        next[c.id] = {
          razorpay_account_id: c.razorpay_account_id || "",
          platform_fee_bps: typeof c.platform_fee_bps === "number" ? c.platform_fee_bps : 1500,
        };
      });
      setPayoutEdits(next);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const savePayout = async (companyId) => {
    try {
      setError("");
      setUserActionLoadingId(companyId);
      const payload = payoutEdits[companyId] || {};
      await api.put(`/admin/companies/${companyId}/payout`, {
        razorpay_account_id: payload.razorpay_account_id || null,
        platform_fee_bps: parseInt(payload.platform_fee_bps, 10),
      });
      await fetchPayoutCompanies();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const togglePermission = (userId, permission) => {
    setSelectedPermissions((prev) => {
      const current = new Set(prev[userId] || []);
      if (current.has(permission)) {
        current.delete(permission);
      } else {
        current.add(permission);
      }
      return { ...prev, [userId]: Array.from(current) };
    });
  };

  const hasPermission = (perm) =>
    !!myPermissions?.is_super_admin || (myPermissions?.permissions || []).includes(perm);

  const isAdminLike = (targetUser) => {
    const role = String(targetUser?.role || "").toLowerCase();
    return !!targetUser?.is_admin || role === "admin" || role === "sub_admin";
  };

  const openConfirm = (message, action) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm: async () => {
        try {
          await action();
        } finally {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        }
      },
    });
  };

  const promoteOrUpdateAdmin = async (targetUser) => {
    try {
      setError("");
      setUserActionLoadingId(targetUser.id);
      const permissions = selectedPermissions[targetUser.id] || [];
      if (isAdminLike(targetUser)) {
        await api.put(`/admin/sub-admins/${targetUser.id}/permissions`, { permissions });
      } else {
        await api.post(`/admin/sub-admins/${targetUser.id}/promote`, { permissions });
      }
      await fetchUsersData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const demoteAdmin = async (targetUser) => {
    try {
      setError("");
      setUserActionLoadingId(targetUser.id);
      try {
        await api.post(`/admin/sub-admins/${targetUser.id}/demote`);
      } catch (err) {
        if (err?.response?.status === 404) {
          await api.post(`/admin/sub-admins/${targetUser.id}/depromote`);
        } else {
          throw err;
        }
      }
      await fetchUsersData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const toggleUserActive = async (targetUser) => {
    try {
      setError("");
      setUserActionLoadingId(targetUser.id);
      const endpoint = targetUser.is_active
        ? `/admin/users/${targetUser.id}/deactivate`
        : `/admin/users/${targetUser.id}/activate`;
      await api.post(endpoint);
      await fetchUsersData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const restoreUser = async (targetUser) => {
    try {
      setError("");
      setUserActionLoadingId(targetUser.id);
      await api.put(`/admin/users/${targetUser.id}/restore`);
      await fetchUsersData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const purgeUser = async (targetUser) => {
    openConfirm(
      `Permanently purge ${targetUser.email}? This will revoke access and anonymize data.`,
      async () => {
        try {
          setError("");
          setUserActionLoadingId(targetUser.id);
          await api.delete(`/admin/users/${targetUser.id}/purge`);
          await fetchUsersData();
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setUserActionLoadingId(null);
        }
      }
    );
  };

  const deleteUser = async (targetUser) => {
    openConfirm(`Delete user ${targetUser.email}? This cannot be undone.`, async () => {
      try {
        setError("");
        setUserActionLoadingId(targetUser.id);
        try {
          await api.delete(`/admin/users/${targetUser.id}`);
        } catch {
          // Backward compatibility with older backend route
          await api.delete(`/admin/delete/${targetUser.id}`);
        }
        await fetchUsersData();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setUserActionLoadingId(null);
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  const handleStationFormChange = (e) => {
    setStationForm({ ...stationForm, [e.target.name]: e.target.value });
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/stations/", {
        ...stationForm,
        latitude: parseFloat(stationForm.latitude) || 0,
        longitude: parseFloat(stationForm.longitude) || 0,
        available_slots: parseInt(stationForm.available_slots) || 5,
        opening_time: "06:00:00",
        closing_time: "22:00:00",
      });
      setStationForm({ name: "", address: "", latitude: "", longitude: "", phone: "", available_slots: 5 });
      fetchStations();
      alert("Station added successfully!");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteStation = async (id) => {
    openConfirm("Are you sure you want to delete this station?", async () => {
      try {
        setError("");
        await api.delete(`/stations/${id}`);
        fetchStations();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: getMonthKey(date),
        label: date.toLocaleString("en-US", { month: "short" }),
        revenue: 0,
        height: 0,
      };
    });

    const monthIndex = new Map(monthBuckets.map((month, index) => [month.key, index]));
    bookings.filter(isPaidBooking).forEach((booking) => {
      const date = getBookingDate(booking);
      if (!date) return;
      const index = monthIndex.get(getMonthKey(date));
      if (index === undefined) return;
      monthBuckets[index].revenue += getBookingAmount(booking);
    });

    const maxRevenue = Math.max(...monthBuckets.map((month) => month.revenue), 0);
    const monthlyRevenue = monthBuckets.map((month) => ({
      ...month,
      height: maxRevenue > 0 ? Math.max(6, Math.round((month.revenue / maxRevenue) * 100)) : 0,
    }));

    const datedBookings = bookings
      .map((booking) => ({ booking, date: getBookingDate(booking) }))
      .filter((item) => item.date);
    const today = new Date(now);
    const last7Start = addDays(today, -7);
    const previous7Start = addDays(today, -14);
    const last30Start = addDays(today, -30);
    const previous30Start = addDays(today, -60);
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const previousYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(today.getFullYear(), 0, 1);

    const bookingTrends = [
      {
        label: "Last 7 days",
        ...getTrend(
          countBookingsBetween(datedBookings, last7Start, today),
          countBookingsBetween(datedBookings, previous7Start, last7Start)
        ),
      },
      {
        label: "Last 30 days",
        ...getTrend(
          countBookingsBetween(datedBookings, last30Start, today),
          countBookingsBetween(datedBookings, previous30Start, last30Start)
        ),
      },
      {
        label: "This year",
        ...getTrend(
          countBookingsBetween(datedBookings, yearStart, today),
          countBookingsBetween(datedBookings, previousYearStart, previousYearEnd)
        ),
      },
    ];

    const stationActivityMap = new Map();
    stations.forEach((station) => {
      stationActivityMap.set(station.id ?? station.name, {
        name: station.name || `Station #${station.id}`,
        bookings: 0,
      });
    });

    bookings.forEach((booking) => {
      const key = getStationKey(booking);
      if (key === null) return;
      const station = stationActivityMap.get(key) || {
        name: booking?.station?.name || booking?.station_name || `Station #${key}`,
        bookings: 0,
      };
      station.bookings += 1;
      stationActivityMap.set(key, station);
    });

    const stationActivity = Array.from(stationActivityMap.values())
      .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name))
      .slice(0, 4);
    const maxStationBookings = Math.max(...stationActivity.map((station) => station.bookings), 0);

    return {
      monthlyRevenue,
      hasRevenue: maxRevenue > 0,
      bookingTrends,
      stationActivity: stationActivity.map((station) => ({
        ...station,
        width: maxStationBookings > 0 ? Math.round((station.bookings / maxStationBookings) * 100) : 0,
      })),
    };
  }, [bookings, stations]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-cyan-400">⚡ Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "overview" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("stations")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "stations" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            🔌 Manage Stations
          </button>
          <button
            onClick={() => setActiveTab("add-station")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "add-station" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            ➕ Add Station
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "bookings" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            📅 View Bookings
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "users" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            👥 Manage Users
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "analytics" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => setActiveTab("audit-logs")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "audit-logs"
                ? "bg-cyan-500 text-white"
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            Audit Logs
          </button>
          <Link
            to="/admin/soc"
            className="block w-full text-left px-4 py-3 rounded-lg transition text-gray-300 hover:bg-slate-700"
          >
            SOC Dashboard
          </Link>
          <Link
            to="/admin/monitoring"
            className="block w-full text-left px-4 py-3 rounded-lg transition text-gray-300 hover:bg-slate-700"
          >
            Live Monitoring
          </Link>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "settings" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
              activeTab === "payouts"
                ? "bg-cyan-500 text-white"
                : "text-gray-300 hover:bg-slate-700"
            }`}
          >
            Split Payouts
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link to="/" className="block text-gray-400 hover:text-cyan-400 mb-3 text-sm">
            ← Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/50 hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-slate-800/50 border-b border-slate-700 px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "stations" && "Manage Stations"}
              {activeTab === "add-station" && "Add New Station"}
              {activeTab === "bookings" && "All Bookings"}
              {activeTab === "users" && "Manage Users"}
              {activeTab === "analytics" && "Analytics & Reports"}
              {activeTab === "audit-logs" && "Admin Audit Logs"}
              {activeTab === "settings" && "Settings"}
              {activeTab === "payouts" && "Split Payouts"}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Welcome, {user.name}</span>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <p className="text-cyan-300 text-sm">Total Stations</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {overviewLoading ? "..." : formatCount(overviewStats.totalStations)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                  <p className="text-green-300 text-sm">Active Bookings</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {overviewLoading ? "..." : formatCount(overviewStats.activeBookings)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                  <p className="text-purple-300 text-sm">Registered Users</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {overviewLoading ? "..." : formatCount(overviewStats.registeredUsers)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <p className="text-yellow-300 text-sm">Total Revenue</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {overviewLoading ? "..." : formatRevenue(overviewStats.totalRevenue)}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab("add-station")}
                    className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition text-center"
                  >
                    ➕ Add Station
                  </button>
                  <button
                    onClick={() => setActiveTab("stations")}
                    className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition text-center"
                  >
                    🔌 View Stations
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition text-center"
                  >
                    📅 View Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition text-center"
                  >
                    📊 View Reports
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Backend API</span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-green-400 text-sm">Online</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Database</span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-green-400 text-sm">Online</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Payment Gateway</span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-green-400 text-sm">Online</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MANAGE STATIONS TAB */}
          {activeTab === "stations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-400">Manage all charging stations</p>
                <button
                  onClick={() => setActiveTab("add-station")}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                >
                  ➕ Add New Station
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading stations...</p>
              ) : stations.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-gray-400 mb-4">No stations found</p>
                  <button
                    onClick={() => setActiveTab("add-station")}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg"
                  >
                    Add Your First Station
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Station Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Address</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Slots</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map((station) => (
                        <tr key={station.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="px-6 py-4 text-white font-medium">{station.name}</td>
                          <td className="px-6 py-4 text-gray-400">{station.address}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                              {station.available_slots}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">{station.phone || "N/A"}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteStation(station.id)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ADD STATION TAB */}
          {activeTab === "add-station" && (
            <div className="max-w-2xl">
              <p className="text-gray-400 mb-6">Add a new charging station to the network</p>
              
              <form onSubmit={handleAddStation} className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Station Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={stationForm.name}
                    onChange={handleStationFormChange}
                    required
                    placeholder="e.g., Central Plaza Charging Hub"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={stationForm.address}
                    onChange={handleStationFormChange}
                    required
                    placeholder="e.g., MG Road, Bangalore"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      value={stationForm.latitude}
                      onChange={handleStationFormChange}
                      step="0.0001"
                      placeholder="12.9716"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      value={stationForm.longitude}
                      onChange={handleStationFormChange}
                      step="0.0001"
                      placeholder="77.5946"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={stationForm.phone}
                      onChange={handleStationFormChange}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Available Slots *</label>
                    <input
                      type="number"
                      name="available_slots"
                      value={stationForm.available_slots}
                      onChange={handleStationFormChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
                >
                  ➕ Add Station
                </button>
              </form>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div>
              <p className="text-gray-400 mb-6">View all customer bookings</p>
              
              {loading ? (
                <p className="text-gray-400">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-gray-400">No bookings found</p>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Car Number</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="px-6 py-4 text-gray-400">#{booking.id}</td>
                          <td className="px-6 py-4 text-white">{booking.name}</td>
                          <td className="px-6 py-4 text-gray-400">{booking.car_number}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div>
              <p className="text-gray-400 mb-2">Manage users and admin access</p>
              <p className="text-cyan-300 mb-6 text-sm">
                Your role: {myPermissions?.is_super_admin ? "Main Admin" : "Sub Admin"}
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setUserListMode("active")}
                  className={`px-3 py-2 rounded text-sm border ${
                    userListMode === "active"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                      : "border-slate-600 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setUserListMode("trash")}
                  className={`px-3 py-2 rounded text-sm border ${
                    userListMode === "trash"
                      ? "border-red-300 bg-red-500/15 text-red-100"
                      : "border-slate-600 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  Trash
                </button>
                <button
                  onClick={() => setUserListMode("all")}
                  className={`px-3 py-2 rounded text-sm border ${
                    userListMode === "all"
                      ? "border-slate-300 bg-slate-700/40 text-slate-100"
                      : "border-slate-600 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  All
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading users...</p>
              ) : users.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((u) => {
                    const isSelf = user?.id === u.id;
                    const isSubAdmin = isAdminLike(u);
                    const isMainAdmin = !!u.is_super_admin;
                    const isDeleted = !!u.is_deleted;
                    const canManageAdmin = myPermissions?.is_super_admin && !isMainAdmin && !isSelf;
                    const canDeleteUser = myPermissions?.is_super_admin && hasPermission("manage_users") && !isMainAdmin && !isSelf;
                    const canManageUserStatus = hasPermission("manage_users") && !isMainAdmin && !isSelf;
                    const pending = userActionLoadingId === u.id;

                    return (
                      <div key={u.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="text-white font-medium">
                              #{u.id} {u.name} {isSelf ? "(You)" : ""}
                            </p>
                            <p className="text-gray-400 text-sm">{u.email} {u.phone ? `| ${u.phone}` : ""}</p>
                            <div className="mt-2 flex gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded text-xs ${u.is_active ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                {u.is_active ? "Active" : "Inactive"}
                              </span>
                              {isDeleted && (
                                <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-200 border border-red-500/30">
                                  Deleted
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${isSubAdmin ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-600 text-gray-300"}`}>
                                {u.is_super_admin ? "Main Admin" : isSubAdmin ? "Sub Admin" : "User"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {canManageUserStatus && !isDeleted && (
                              <button
                                onClick={() => toggleUserActive(u)}
                                disabled={pending}
                                className="px-3 py-1 text-xs rounded border border-amber-500/60 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                              >
                                {u.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}

                            {canManageUserStatus && isDeleted && (
                              <button
                                onClick={() => restoreUser(u)}
                                disabled={pending}
                                className="px-3 py-1 text-xs rounded border border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                              >
                                Restore
                              </button>
                            )}

                            {canDeleteUser && isDeleted && (
                              <button
                                onClick={() => purgeUser(u)}
                                disabled={pending}
                                className="px-3 py-1 text-xs rounded border border-red-500/70 text-red-100 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                Purge
                              </button>
                            )}

                            {canManageAdmin && isSubAdmin && (
                              <button
                                onClick={() => demoteAdmin(u)}
                                disabled={pending}
                                className="px-3 py-1 text-xs rounded border border-red-500/60 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                Demote to User
                              </button>
                            )}

                            {canDeleteUser && !isDeleted && (
                              <button
                                onClick={() => deleteUser(u)}
                                disabled={pending}
                                className="px-3 py-1 text-xs rounded border border-red-700/60 text-red-200 hover:bg-red-600/20 disabled:opacity-50"
                              >
                                Delete User
                              </button>
                            )}
                          </div>
                        </div>

                        {canManageAdmin && (
                          <div className="mt-4 border-t border-slate-700 pt-4">
                            <p className="text-sm text-gray-300 mb-2">Assign permissions:</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {permissionCatalog.map((perm) => (
                                <label
                                  key={`${u.id}-${perm}`}
                                  className="inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-600 text-xs text-gray-200"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(selectedPermissions[u.id] || []).includes(perm)}
                                    onChange={() => togglePermission(u.id, perm)}
                                  />
                                  <span>{perm}</span>
                                </label>
                              ))}
                            </div>
                            <button
                              onClick={() => promoteOrUpdateAdmin(u)}
                              disabled={pending}
                              className="px-3 py-1 text-xs rounded border border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
                            >
                              {isSubAdmin ? "Update Admin Permissions" : "Promote to Sub Admin"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={fetchUsersData}
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                  Refresh Users
                </button>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div>
              <p className="text-gray-400 mb-6">View analytics and reports</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue</h3>
                  {overviewLoading ? (
                    <p className="text-gray-400">Loading analytics...</p>
                  ) : (
                    <>
                      <div className="flex items-end gap-2 h-40">
                        {analytics.monthlyRevenue.map((month) => (
                          <div key={month.key} className="flex-1 h-full flex items-end">
                            <div
                              className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                              style={{ height: `${month.height}%` }}
                              title={`${month.label}: ${formatRevenue(month.revenue)}`}
                            ></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        {analytics.monthlyRevenue.map((month) => (
                          <span key={month.key}>{month.label}</span>
                        ))}
                      </div>
                      {!analytics.hasRevenue && (
                        <p className="text-sm text-gray-400 mt-4">No paid revenue yet.</p>
                      )}
                    </>
                  )}
                </div>
                
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Booking Trends</h3>
                  {overviewLoading ? (
                    <p className="text-gray-400">Loading trends...</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.bookingTrends.map((trend) => (
                        <div key={trend.label} className="flex justify-between items-center gap-4">
                          <div>
                            <span className="text-gray-400">{trend.label}</span>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatCount(trend.current)} now / {formatCount(trend.previous)} before
                            </p>
                          </div>
                          <span className={`${trend.tone} font-semibold`}>{trend.changeLabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Station Activity</h3>
                {overviewLoading ? (
                  <p className="text-gray-400">Loading station activity...</p>
                ) : analytics.stationActivity.length === 0 ? (
                  <p className="text-gray-400">No station data yet.</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.stationActivity.map((station) => (
                      <div key={station.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{station.name}</span>
                          <span className="text-cyan-400">{formatCount(station.bookings)} bookings</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{ width: `${station.width}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === "audit-logs" && (
            <div>
              <p className="text-gray-400 mb-6">Review admin actions across the platform</p>

              {loading ? (
                <p className="text-gray-400">Loading audit logs...</p>
              ) : adminLogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-gray-400">No audit logs found</p>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Timestamp</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Admin ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Target</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminLogs.map((log) => (
                        <tr key={log.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="px-6 py-4 text-gray-400">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-4 text-white">#{log.admin_id}</td>
                          <td className="px-6 py-4 text-cyan-300">{log.action || "-"}</td>
                          <td className="px-6 py-4 text-gray-300">{log.target || "-"}</td>
                          <td className="px-6 py-4 text-gray-400">{log.ip_address || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SPLIT PAYOUTS TAB */}
          {activeTab === "payouts" && (
            <div>
              <p className="text-gray-400 mb-2">
                Main Admin can store station-owner Razorpay Route linked account IDs per company.
              </p>
              <p className="text-slate-400 text-sm mb-6">
                Platform fee in BPS: 1500 = 15.00%. Owner receives the rest automatically after payment verification.
              </p>

              {!myPermissions?.is_super_admin && (
                <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200">
                  Only Main Admin can edit payout settings.
                </div>
              )}

              {loading ? (
                <p className="text-gray-400">Loading companies...</p>
              ) : companies.length === 0 ? (
                <p className="text-gray-400">No companies found.</p>
              ) : (
                <div className="space-y-3">
                  {companies.map((c) => {
                    const pending = userActionLoadingId === c.id;
                    const edit = payoutEdits[c.id] || { razorpay_account_id: "", platform_fee_bps: 1500 };
                    return (
                      <div key={c.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="text-white font-medium">#{c.id} {c.name}</p>
                            <p className="text-xs text-slate-400">
                              {c.country} {c.category ? `| ${c.category}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-col md:flex-row gap-2 md:items-center">
                            <input
                              value={edit.razorpay_account_id}
                              onChange={(e) =>
                                setPayoutEdits((prev) => ({
                                  ...prev,
                                  [c.id]: { ...edit, razorpay_account_id: e.target.value },
                                }))
                              }
                              placeholder="acc_..."
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm w-full md:w-72"
                              disabled={!myPermissions?.is_super_admin || pending}
                            />
                            <input
                              type="number"
                              value={edit.platform_fee_bps}
                              onChange={(e) =>
                                setPayoutEdits((prev) => ({
                                  ...prev,
                                  [c.id]: { ...edit, platform_fee_bps: e.target.value },
                                }))
                              }
                              min="0"
                              max="10000"
                              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm w-full md:w-40"
                              disabled={!myPermissions?.is_super_admin || pending}
                            />
                            <button
                              onClick={() => savePayout(c.id)}
                              disabled={!myPermissions?.is_super_admin || pending}
                              className="px-3 py-2 rounded border border-cyan-500/60 text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50 text-sm"
                            >
                              {pending ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <p className="text-gray-400 mb-6">Manage system settings</p>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Site Name</label>
                    <input
                      type="text"
                      defaultValue="EV Charging Network"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Support Email</label>
                    <input
                      type="email"
                      defaultValue="support@evcharging.in"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Support Phone</label>
                    <input
                      type="tel"
                      defaultValue="100-1234-987"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500" />
                    <span className="text-gray-300">Email notifications for new bookings</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500" />
                    <span className="text-gray-300">SMS alerts for station issues</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-cyan-500" />
                    <span className="text-gray-300">Daily summary reports</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm || (() => {})}
        onCancel={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
      />
    </div>
  );
}
