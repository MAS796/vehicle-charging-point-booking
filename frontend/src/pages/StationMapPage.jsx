import React from "react";
import StationMap from "../components/StationMap";

export default function StationMapPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Charging Stations</h2>
        <p className="text-gray-500 mb-6">
          Find EV charging stations near you on the map. Click any marker to view details and book.
        </p>
        <StationMap />
      </div>
    </div>
  );
}
