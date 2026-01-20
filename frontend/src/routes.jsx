import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import StationDetails from "./pages/StationDetails";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import AllStations from "./pages/AllStations";
import NearbyStations from "./pages/NearbyStations";
import AllBookings from "./pages/AllBookings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/station/:id" element={<StationDetails />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/stations" element={<AllStations />} />
      <Route path="/admin/nearby" element={<NearbyStations />} />
      <Route path="/admin/bookings" element={<AllBookings />} />
    </Routes>
  );
}
