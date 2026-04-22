import { useEffect, useState } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/");
        setBookings(res.data || []);
      } catch (err) {
        setError("Failed to fetch bookings: " + getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-cyan-400">All Bookings</h2>

        {error && <p className="text-red-400 mb-4 p-4 bg-red-900/30 rounded-lg">{error}</p>}
        {loading && <p className="text-gray-400">Loading bookings...</p>}
        {bookings.length === 0 && !error && !loading && (
          <p className="text-gray-400">No bookings yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-cyan-500/50 transition">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-semibold text-white">{b.name}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  b.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                  b.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {b.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">🚗 {b.car_number}</p>
              <p className="text-gray-500 text-xs">Booking ID: #{b.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
