import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminBg from "../assets/admin-bg.jpg";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in as admin
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!storedUser || role !== "admin") {
      navigate("/admin/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (err) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${adminBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Neon grid overlay effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-blue-500/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-500/30 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Admin Control Panel
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}!</h2>
              <p className="text-cyan-300">Manage your EV charging infrastructure in real-time</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat Card 1 */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-md hover:border-cyan-500/60 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm font-medium">Active Stations</p>
                  <p className="text-3xl font-bold text-white mt-2">12</p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 backdrop-blur-md hover:border-green-500/60 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Active Bookings</p>
                  <p className="text-3xl font-bold text-white mt-2">48</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-md hover:border-purple-500/60 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">324</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-md hover:border-yellow-500/60 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">$12.5K</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Large Chart Area */}
            <div className="lg:col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-4">System Overview</h3>
              <div className="h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-cyan-500/20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-cyan-400 text-lg font-semibold">📊 Real-time Dashboard</p>
                  <p className="text-gray-400 text-sm mt-2">Analytics and metrics coming soon</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg border border-cyan-500/50 transition font-medium">
                    Add Station
                  </button>
                  <button className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg border border-green-500/50 transition font-medium">
                    View Bookings
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg border border-blue-500/50 transition font-medium">
                    Manage Users
                  </button>
                  <button className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 rounded-lg border border-orange-500/50 transition font-medium">
                    View Reports
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Backend API</span>
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Database</span>
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Payment Gateway</span>
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
