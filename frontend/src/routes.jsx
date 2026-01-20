import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StationDetails from "./pages/StationDetails";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import AllStations from "./pages/AllStations";
import NearbyStations from "./pages/NearbyStations";
import AllBookings from "./pages/AllBookings";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/station/:id" element={<StationDetails />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/stations" element={<ProtectedRoute><AllStations /></ProtectedRoute>} />
      <Route path="/admin/nearby" element={<ProtectedRoute><NearbyStations /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute><AllBookings /></ProtectedRoute>} />
    </Routes>
  );
}
