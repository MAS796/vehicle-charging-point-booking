import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconAnchor: [12, 41],
});

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStation = (station) => ({
  ...station,
  name: station?.name || station?.station_name || `Station ${station?.id ?? ""}`.trim(),
  latitude: toNumber(station?.latitude),
  longitude: toNumber(station?.longitude),
});

export default function StationMap({
  stations = null,
  center = [12.9716, 77.5946],
  zoom = 12,
  height = 500,
  onSelectStation,
  onOpenStation,
}) {
  const [loadedStations, setLoadedStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shouldFetch = stations === null;

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }
    const loadStations = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/stations");
        setLoadedStations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load stations for map:", err);
        setError("Unable to load stations");
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [shouldFetch]);

  const sourceStations = useMemo(
    () => (Array.isArray(stations) ? stations : loadedStations),
    [loadedStations, stations]
  );

  const mappableStations = useMemo(
    () =>
      sourceStations
        .map(normalizeStation)
        .filter((station) => station.latitude !== null && station.longitude !== null),
    [sourceStations]
  );

  if (loading) {
    return <div className="map-loading">Loading map...</div>;
  }

  if (error) {
    return <div className="map-empty">{error}</div>;
  }

  if (!mappableStations.length) {
    return <div className="map-empty">No stations found</div>;
  }

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={zoom} style={{ height: `${height}px`, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mappableStations.map((station) => (
          <Marker
            key={station.id}
            icon={markerIcon}
            position={[station.latitude, station.longitude]}
            eventHandlers={{
              click: () => onSelectStation?.(station),
            }}
          >
            <Popup>
              <b>{station.name}</b>
              <br />
              {station.address || "Address not available"}
              <br />
              {typeof station.available_slots === "number" ? `Slots: ${station.available_slots}` : null}
              {onOpenStation ? (
                <div style={{ marginTop: "8px" }}>
                  <button className="view-btn" onClick={() => onOpenStation(station)}>
                    Open Booking
                  </button>
                </div>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
