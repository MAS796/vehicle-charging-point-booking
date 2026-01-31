import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import RegisterOTP from "./pages/RegisterOTP";
import StationDetails from "./pages/StationDetails";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import AllStations from "./pages/AllStations";
import NearbyStations from "./pages/NearbyStations";
import AllBookings from "./pages/AllBookings";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Insights from "./pages/Insights";
import NetworkMap from "./pages/NetworkMap";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterOTP />} />
      <Route path="/station/:id" element={<StationDetails />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/company/:id" element={<CompanyDetail />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/network-map" element={<NetworkMap />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      
      {/* Protected Routes - Requires Authentication */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes - Requires Admin Role */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/stations" element={
        <ProtectedRoute role="admin">
          <AllStations />
        </ProtectedRoute>
      } />
      <Route path="/admin/nearby" element={
        <ProtectedRoute role="admin">
          <NearbyStations />
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute role="admin">
          <AllBookings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
