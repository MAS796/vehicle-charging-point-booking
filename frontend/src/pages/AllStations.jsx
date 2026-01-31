import { useState, useEffect } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function AllStations() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    phone: "",
    available_slots: 5,
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get("/stations/");
      setStations(res.data);
    } catch (err) {
      setError("Failed to fetch stations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addStation = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stations/", {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        available_slots: parseInt(form.available_slots),
        opening_time: "06:00:00",
        closing_time: "22:00:00"
      });
      setForm({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
        phone: "",
        available_slots: 5,
      });
      fetchStations();
      alert("Station added successfully!");
    } catch (err) {
      setError("Failed to add station: " + getErrorMessage(err));
      console.error(err);
    }
  };

  const deleteStation = async (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      try {
        await api.delete(`/admin/stations/${id}`, {
          params: { user_id: user.id }
        });
        fetchStations();
      } catch (err) {
        setError("Failed to delete station: " + getErrorMessage(err));
      }
    }
  };

  return (
    <div className="container">
      <h2>Manage Charging Stations</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="form" onSubmit={addStation}>
        <h3>Add New Station</h3>
        <input
          name="name"
          placeholder="Station Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          name="latitude"
          type="number"
          placeholder="Latitude"
          value={form.latitude}
          onChange={handleChange}
          step="0.0001"
          required
        />
        <input
          name="longitude"
          type="number"
          placeholder="Longitude"
          value={form.longitude}
          onChange={handleChange}
          step="0.0001"
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="available_slots"
          type="number"
          placeholder="Available Slots"
          value={form.available_slots}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Station</button>
      </form>

      <h3>All Stations</h3>
      {loading && <p>Loading stations...</p>}

      {stations.length === 0 && !loading && <p>No stations yet.</p>}

      {stations.map((s) => (
        <div key={s.id} className="card">
          <h4>{s.name}</h4>
          <p>{s.address}</p>
          <p><b>Available Slots:</b> {s.available_slots}</p>
          <p><b>Phone:</b> {s.phone}</p>
          <button
            onClick={() => deleteStation(s.id)}
            style={{ backgroundColor: "red", color: "white" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
