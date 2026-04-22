import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/all-stations.css";

const inferCity = (station) => {
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
};

const normalizeSearchText = (value) => (value || "").toLowerCase().replace(/\s+/g, " ").trim();

const buildSearchBlob = (station) => {
  const city = inferCity(station);
  const cityAliases =
    city === "bangalore"
      ? "bangalore bengaluru"
      : city === "delhi"
        ? "delhi new delhi"
        : city === "mumbai"
          ? "mumbai bombay"
          : "";

  return normalizeSearchText(
    `${station.name || ""} ${station.location || ""} ${station.address || ""} ${station.operator || ""} ${station.charger_types || ""} ${cityAliases}`
  );
};

export default function AllStations() {
  const { t } = useTranslation();
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    phone: "",
    available_slots: 5,
  });

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/stations/");
      const metroStations = (res.data || []).filter((station) => inferCity(station) !== "other");
      setStations(metroStations);
    } catch (err) {
      setError(getErrorMessage(err, t("loading_stations")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addStation = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stations/", {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        available_slots: parseInt(form.available_slots, 10),
        opening_time: "06:00:00",
        closing_time: "22:00:00",
      });
      setForm({ name: "", address: "", latitude: 0, longitude: 0, phone: "", available_slots: 5 });
      fetchStations();
      alert("Station added successfully");
    } catch (err) {
      setError("Failed to add station: " + getErrorMessage(err));
    }
  };

  const deleteStation = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this station?",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/stations/${id}`, { params: { user_id: user.id } });
          fetchStations();
        } catch (err) {
          setError("Failed to delete station: " + getErrorMessage(err));
        } finally {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        }
      },
    });
  };

  const isAdmin = user?.is_admin || localStorage.getItem("role") === "admin";
  const filteredStations = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    if (!normalizedQuery) return stations;

    const terms = normalizedQuery.split(" ").filter(Boolean);
    return stations.filter((station) => {
      const blob = buildSearchBlob(station);
      return terms.every((term) => blob.includes(term));
    });
  }, [stations, searchQuery]);

  return (
    <div className="all-stations-page min-h-screen text-white p-8">
      <div className="all-stations-shell max-w-6xl mx-auto">
        <h2 className="all-stations-title text-3xl font-bold mb-2 text-cyan-400">
          {isAdmin ? t("manage_stations") : t("find_charging_stations")}
        </h2>
        <p className="all-stations-subtitle text-gray-400 mb-8">
          {isAdmin ? t("add_station_admin_help") : t("browse_station_help")}
        </p>

        {error && <p className="all-stations-error text-red-400 mb-4 p-4 rounded-lg">{error}</p>}

        <div className="search-panel mb-6">
          <label htmlFor="station-search" className="block text-sm font-medium text-cyan-300 mb-2">
            Search by city, area, or address
          </label>
          <input
            id="station-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Example: Bangalore, Indiranagar, Delhi, Mumbai"
            className="station-search-input w-full md:w-2/3 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none"
          />
          <p className="all-stations-summary text-gray-400 text-sm mt-2">
            Showing {filteredStations.length} of {stations.length} station(s)
          </p>
        </div>

        {isAdmin && (
          <div className="station-admin-panel rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-cyan-300">Add New Station</h3>
            <form onSubmit={addStation} className="station-admin-form grid grid-cols-1 md:grid-cols-2">
              <input name="name" placeholder="Station Name" value={form.name} onChange={handleChange} required className="station-form-input px-4 py-3 rounded-lg focus:outline-none" />
              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required className="station-form-input px-4 py-3 rounded-lg focus:outline-none" />
              <input name="latitude" type="number" placeholder="Latitude" value={form.latitude} onChange={handleChange} step="0.0001" required className="station-form-input px-4 py-3 rounded-lg focus:outline-none" />
              <input name="longitude" type="number" placeholder="Longitude" value={form.longitude} onChange={handleChange} step="0.0001" required className="station-form-input px-4 py-3 rounded-lg focus:outline-none" />
              <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="station-form-input px-4 py-3 rounded-lg focus:outline-none" />
              <input name="available_slots" type="number" placeholder="Available Slots" value={form.available_slots} onChange={handleChange} required className="station-form-input px-4 py-3 rounded-lg focus:outline-none" />
              <button type="submit" className="station-primary-btn md:col-span-2 px-6 py-3 rounded-lg font-semibold transition">Add Station</button>
            </form>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4 text-cyan-300">{isAdmin ? "All Stations" : "Available Charging Stations"}</h3>
        {loading && <p className="text-gray-400">{t("loading_stations")}</p>}
        {!loading && stations.length === 0 && <p className="text-gray-400">{t("no_stations_available")}</p>}
        {!loading && stations.length > 0 && filteredStations.length === 0 && (
          <p className="text-gray-300 mb-4">No stations match your search.</p>
        )}

        <div className="station-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredStations.map((s) => (
            <div key={s.id} className="station-card-premium rounded-xl p-5 transition">
              <h4 className="text-lg font-semibold text-white mb-2">{s.name}</h4>
              {s.location && <p className="text-cyan-300 text-sm mb-1">Location: {s.location}</p>}
              <p className="text-gray-400 text-sm mb-2">{s.address}</p>
              {s.operator && <p className="text-gray-300 text-sm mb-1">Operator: {s.operator}</p>}
              {s.charger_types && <p className="text-gray-300 text-sm mb-2">Chargers: {s.charger_types}</p>}
              <div className="station-meta-row flex justify-between text-sm mb-4">
                <span className="text-cyan-400">Slots: {s.available_slots}</span>
                <span className="text-gray-500">{s.phone}</span>
              </div>

              {isAdmin ? (
                <button onClick={() => deleteStation(s.id)} className="station-delete-btn w-full px-4 py-2 rounded-lg transition">{t("delete")}</button>
              ) : (
                <Link to={`/station/${s.id}`} className="station-primary-btn block w-full px-4 py-2 text-white text-center rounded-lg font-semibold transition">{t("book_slot")}</Link>
              )}
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm || (() => {})}
        onCancel={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
      />
    </div>
  );
}
