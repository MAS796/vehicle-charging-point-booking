import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function ChargingLocator() {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    chargingType: "all",
    availableSlots: 0,
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stations");
      setStations(res.data);
      setFilteredStations(res.data);
    } catch (err) {
      console.error("Error fetching stations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = stations;

    if (searchQuery) {
      result = result.filter(
        (station) =>
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      result = result.filter((station) => {
        const isOpen = station.is_open;
        return filters.status === "open" ? isOpen : !isOpen;
      });
    }

    if (filters.availableSlots > 0) {
      result = result.filter((station) => station.available_slots >= filters.availableSlots);
    }

    setFilteredStations(result);
  }, [searchQuery, filters, stations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      
      {/* HERO SECTION - Network Statistics */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-2">⚡ EV Charging Network</h1>
          <p className="text-blue-100 text-lg mb-8">Growing charging infrastructure across India</p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Total Stations</p>
              <p className="text-4xl font-bold mt-2">{stations.length}+</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Active Now</p>
              <p className="text-4xl font-bold mt-2">{stations.filter(s => s.is_open).length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Total Slots</p>
              <p className="text-4xl font-bold mt-2">{stations.reduce((sum, s) => sum + (s.available_slots || 0), 0)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">24/7 Support</p>
              <p className="text-2xl font-bold mt-2">✅ Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* EMERGENCY SUPPORT BANNER */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">🚨 Emergency Charging Support</h3>
            <p className="text-red-100 mt-1">24/7 Roadside Assistance in 5 Major Cities</p>
          </div>
          <a href="tel:18002098282" className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition">
            📞 1800-209-8282
          </a>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 sticky top-20 space-y-6">
              
              <div>
                <label className="block text-white font-semibold mb-3">🔍 Search</label>
                <input
                  type="text"
                  placeholder="Station name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">📍 Status</label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Stations" },
                    { value: "open", label: "🟢 Open Now" },
                    { value: "closed", label: "🔴 Closed" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={filters.status === option.value}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">⚡ Charging Type</label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "fast", label: "⚡ Fast Charge (50kW)" },
                    { value: "super", label: "⚡⚡ Super Charge (150kW)" },
                    { value: "dc", label: "🔌 DC Charger" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="chargingType"
                        value={option.value}
                        checked={filters.chargingType === option.value}
                        onChange={(e) => setFilters({ ...filters, chargingType: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">🔌 Min. Available Slots</label>
                <input
                  type="number"
                  min="0"
                  value={filters.availableSlots}
                  onChange={(e) => setFilters({ ...filters, availableSlots: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ status: "all", chargingType: "all", availableSlots: 0 });
                }}
                className="w-full px-4 py-2 bg-gray-500/30 hover:bg-gray-500/50 text-gray-300 rounded-lg border border-gray-500/50 transition font-medium"
              >
                🔄 Reset Filters
              </button>

              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Stations Found</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{filteredStations.length}</p>
              </div>

              {/* Network Info */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">📊 Network Coverage</p>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>✓ Pan India Network</li>
                  <li>✓ 24/7 Support Available</li>
                  <li>✓ Real-time Availability</li>
                  <li>✓ Mobile App Integration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* FEATURED STATIONS */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">⭐ Featured Stations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.slice(0, 2).map((station) => (
                  <div key={station.id} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-white font-bold text-lg">{station.name}</h3>
                      <span className="bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">⭐ Featured</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{station.address}</p>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-yellow-300">🔌 {station.available_slots} slots</span>
                      <span className={station.is_open ? "text-green-300" : "text-red-300"}>
                        {station.is_open ? "🟢 Open" : "🔴 Closed"}
                      </span>
                    </div>
                    <button className="w-full bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300 py-2 rounded-lg transition font-medium">
                      Book Now →
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* MAP & LIST SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Map Area */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 h-96 lg:h-auto lg:row-span-2">
                <h3 className="text-white font-bold mb-4">🗺️ Network Map</h3>
                <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-slate-900/50 rounded-lg border border-blue-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-blue-400 text-lg font-semibold">📍 Interactive Map</p>
                    <p className="text-gray-400 text-sm mt-2">Showing {filteredStations.length} stations</p>
                    <p className="text-gray-500 text-xs mt-3">Map integration available</p>
                  </div>
                </div>
              </div>

              {/* Stations List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-white font-bold text-lg">📋 Available Stations</h3>
                
                {filteredStations.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                    <p className="text-gray-300">No stations found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredStations.map((station) => (
                      <div
                        key={station.id}
                        onClick={() => setSelectedStation(station)}
                        className={`bg-white/10 backdrop-blur-md border rounded-lg p-4 cursor-pointer transition transform hover:scale-105 ${
                          selectedStation?.id === station.id
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-semibold flex-1">{station.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            station.is_open
                              ? "bg-green-500/30 text-green-300"
                              : "bg-red-500/30 text-red-300"
                          }`}>
                            {station.is_open ? "🟢 OPEN" : "🔴 CLOSED"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{station.address}</p>
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>🔌 {station.available_slots} slots</span>
                          <span className="text-blue-300">Details →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Station Details */}
              {selectedStation && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">📊 Station Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Station Name</p>
                      <p className="text-white font-semibold">{selectedStation.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Address</p>
                      <p className="text-white">{selectedStation.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <p className={selectedStation.is_open ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                          {selectedStation.is_open ? "🟢 Open" : "🔴 Closed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Available Slots</p>
                        <p className="text-blue-400 font-semibold">{selectedStation.available_slots}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Operating Hours</p>
                      <p className="text-white">{selectedStation.opening_time} - {selectedStation.closing_time}</p>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-gray-400 text-sm mb-3">Available Chargers</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/10 p-2 rounded">
                          <span className="text-gray-300">⚡ Fast Charge (50kW)</span>
                          <span className="text-green-400 font-semibold">Available</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 p-2 rounded">
                          <span className="text-gray-300">⚡⚡ Super Charge (150kW)</span>
                          <span className="text-green-400 font-semibold">Available</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition">
                      📅 Book Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - Support & Info */}
      <section className="bg-slate-800/50 border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold mb-3">🆘 Support</h3>
              <p className="text-gray-400 text-sm mb-2">24/7 Customer Support</p>
              <a href="tel:18002098282" className="text-blue-400 hover:text-blue-300 font-semibold">1800-209-8282</a>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">🚙 Partner Network</h3>
              <p className="text-gray-400 text-sm">Integrated with major EV platforms and partners</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">📱 Mobile App</h3>
              <p className="text-gray-400 text-sm">Download our app for better experience and real-time updates</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
