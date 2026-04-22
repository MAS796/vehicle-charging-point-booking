import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const CITY_OPTIONS = [
  { value: "all", label: "All Cities" },
  { value: "bangalore", label: "Bangalore" },
  { value: "delhi", label: "Delhi" },
  { value: "mumbai", label: "Mumbai" },
];

function inferCity(station) {
  const externalId = (station.external_id || "").toLowerCase();
  const searchable = `${station.location || ""} ${station.address || ""}`.toLowerCase();

  if (externalId.startsWith("blr-") || searchable.includes("bengaluru") || searchable.includes("bangalore")) {
    return "bangalore";
  }
  if (externalId.startsWith("del-") || searchable.includes("new delhi") || searchable.includes("delhi")) {
    return "delhi";
  }
  if (externalId.startsWith("mum-") || searchable.includes("mumbai")) {
    return "mumbai";
  }
  return "other";
}

function matchesChargingType(station, selectedType) {
  if (selectedType === "all") return true;

  const chargingType = (station.charging_type || "").toLowerCase();
  const chargerTypes = (station.charger_types || "").toLowerCase();
  const combined = `${chargingType} ${chargerTypes}`;

  if (selectedType === "ac") return combined.includes("ac") || combined.includes("type2");
  if (selectedType === "dc") return combined.includes("dc") || combined.includes("ccs") || combined.includes("chademo");
  if (selectedType === "fast") return combined.includes("fast");
  return true;
}

export default function ChargingLocator() {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "all",
    status: "all",
    chargingType: "all",
    availableSlots: 0,
  });

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/stations/");
        setStations(res.data || []);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const metroStations = useMemo(
    () => stations.filter((station) => inferCity(station) !== "other"),
    [stations]
  );

  useEffect(() => {
    let result = metroStations;

    if (filters.city !== "all") {
      result = result.filter((station) => inferCity(station) === filters.city);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((station) => {
        const haystack = `${station.name || ""} ${station.location || ""} ${station.address || ""}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    if (filters.status !== "all") {
      result = result.filter((station) => {
        const isOpen = Boolean(station.is_open);
        return filters.status === "open" ? isOpen : !isOpen;
      });
    }

    if (filters.availableSlots > 0) {
      result = result.filter((station) => (station.available_slots || 0) >= filters.availableSlots);
    }

    if (filters.chargingType !== "all") {
      result = result.filter((station) => matchesChargingType(station, filters.chargingType));
    }

    setFilteredStations(result);
  }, [filters, searchQuery, metroStations]);

  useEffect(() => {
    if (selectedStation && !filteredStations.some((s) => s.id === selectedStation.id)) {
      setSelectedStation(null);
    }
  }, [filteredStations, selectedStation]);

  const stationCountByCity = useMemo(() => {
    const counts = { bangalore: 0, delhi: 0, mumbai: 0 };
    for (const station of metroStations) {
      const city = inferCity(station);
      if (counts[city] !== undefined) {
        counts[city] += 1;
      }
    }
    return counts;
  }, [metroStations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading charging stations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">EV Charging Network</h1>
          <p className="text-blue-100 text-base md:text-lg mb-8">
            Search and book EV stations in Bangalore, Delhi, and Mumbai.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Total Stations</p>
              <p className="text-4xl font-bold mt-2">{metroStations.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Open Now</p>
              <p className="text-4xl font-bold mt-2">{metroStations.filter((s) => s.is_open).length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Total Slots</p>
              <p className="text-4xl font-bold mt-2">
                {metroStations.reduce((sum, s) => sum + (s.available_slots || 0), 0)}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30">
              <p className="text-blue-100 text-sm font-medium">Selected City</p>
              <p className="text-2xl font-bold mt-2">
                {filters.city === "all" ? "All" : filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 sticky top-20 space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">Select City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="text-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Search</label>
                <input
                  type="text"
                  placeholder="Station name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Status</label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Stations" },
                    { value: "open", label: "Open Now" },
                    { value: "closed", label: "Closed" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={filters.status === option.value}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Charging Type</label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "ac", label: "AC" },
                    { value: "dc", label: "DC" },
                    { value: "fast", label: "Fast" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="chargingType"
                        value={option.value}
                        checked={filters.chargingType === option.value}
                        onChange={(e) => setFilters((prev) => ({ ...prev, chargingType: e.target.value }))}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Min. Available Slots</label>
                <input
                  type="number"
                  min="0"
                  value={filters.availableSlots}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      availableSlots: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ city: "all", status: "all", chargingType: "all", availableSlots: 0 });
                }}
                className="w-full px-4 py-2 bg-gray-500/30 hover:bg-gray-500/50 text-gray-300 rounded-lg border border-gray-500/50 transition font-medium"
              >
                Reset Filters
              </button>

              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-gray-300 text-sm">Stations Found</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{filteredStations.length}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-xs text-gray-300">
                <p className="text-white font-semibold mb-2">City Coverage</p>
                <p>Bangalore: {stationCountByCity.bangalore}</p>
                <p>Delhi: {stationCountByCity.delhi}</p>
                <p>Mumbai: {stationCountByCity.mumbai}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Featured Stations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.slice(0, 2).map((station) => (
                  <div
                    key={station.id}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <h3 className="text-white font-bold text-lg">{station.name}</h3>
                      <span className="bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">{station.address}</p>
                    {station.location && <p className="text-gray-400 text-xs mb-3">Area: {station.location}</p>}
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-yellow-300">Slots: {station.available_slots || 0}</span>
                      <span className={station.is_open ? "text-green-300" : "text-red-300"}>
                        {station.is_open ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 h-96 lg:h-auto lg:row-span-2">
                <h3 className="text-white font-bold mb-4">Network Map</h3>
                <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-slate-900/50 rounded-lg border border-blue-500/30 flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-blue-300 text-lg font-semibold">Map area</p>
                    <p className="text-gray-400 text-sm mt-2">Showing {filteredStations.length} stations</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Filter by city to view Bangalore, Delhi, or Mumbai stations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg">Available Stations</h3>

                {filteredStations.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                    <p className="text-gray-300">No stations found for the selected filters.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {filteredStations.map((station) => (
                      <button
                        type="button"
                        key={station.id}
                        onClick={() => setSelectedStation(station)}
                        className={`w-full text-left bg-white/10 backdrop-blur-md border rounded-lg p-4 transition ${
                          selectedStation?.id === station.id
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="text-white font-semibold">{station.name}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              station.is_open ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"
                            }`}
                          >
                            {station.is_open ? "OPEN" : "CLOSED"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{station.address}</p>
                        {station.location && <p className="text-gray-400 text-xs mb-1">Area: {station.location}</p>}
                        {station.operator && <p className="text-gray-400 text-xs mb-2">Operator: {station.operator}</p>}
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>Slots: {station.available_slots || 0}</span>
                          <span className="text-blue-300">Details</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedStation && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Station Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Station Name</p>
                      <p className="text-white font-semibold">{selectedStation.name}</p>
                    </div>
                    {selectedStation.location && (
                      <div>
                        <p className="text-gray-400 text-sm">Area</p>
                        <p className="text-white">{selectedStation.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-sm">Address</p>
                      <p className="text-white">{selectedStation.address}</p>
                    </div>
                    {selectedStation.operator && (
                      <div>
                        <p className="text-gray-400 text-sm">Operator</p>
                        <p className="text-white">{selectedStation.operator}</p>
                      </div>
                    )}
                    {selectedStation.charger_types && (
                      <div>
                        <p className="text-gray-400 text-sm">Charger Types</p>
                        <p className="text-white">{selectedStation.charger_types}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <p
                          className={
                            selectedStation.is_open ? "text-green-400 font-semibold" : "text-red-400 font-semibold"
                          }
                        >
                          {selectedStation.is_open ? "Open" : "Closed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Available Slots</p>
                        <p className="text-blue-400 font-semibold">{selectedStation.available_slots || 0}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Operating Hours</p>
                      <p className="text-white">
                        {selectedStation.opening_time} - {selectedStation.closing_time}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
