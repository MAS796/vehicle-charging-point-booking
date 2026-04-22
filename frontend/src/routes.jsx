import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Network = lazy(() => import("./pages/Network"));
const Login = lazy(() => import("./pages/Login"));
const RegisterOTP = lazy(() => import("./pages/RegisterOTP"));
const StationDetails = lazy(() => import("./pages/StationDetails"));
const Payment = lazy(() => import("./pages/Payment"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AllStations = lazy(() => import("./pages/AllStations"));
const NearbyStations = lazy(() => import("./pages/NearbyStations"));
const AllBookings = lazy(() => import("./pages/AllBookings"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DeviceManagement = lazy(() => import("./pages/DeviceManagement"));
const Companies = lazy(() => import("./pages/Companies"));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail"));
const Insights = lazy(() => import("./pages/Insights"));
const NetworkMap = lazy(() => import("./pages/NetworkMap"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminSecurity = lazy(() => import("./pages/AdminSecurity"));
const AdminMonitoring = lazy(() => import("./pages/AdminMonitoring"));
const SOCDashboard = lazy(() => import("./pages/SOCDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const StationMapPage = lazy(() => import("./pages/StationMapPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));


function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-slate-300">
      Loading page...
    </div>
  );
}


export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/network" element={<Network />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterOTP />} />
        <Route path="/stations" element={<AllStations />} />
        <Route path="/station/:id" element={<StationDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/company/:id" element={<CompanyDetail />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/network-map" element={<NetworkMap />} />
        <Route path="/nearby-stations" element={<NearbyStations />} />
        <Route path="/station-map" element={<StationMapPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route
          path="/owner/:ownerId/dashboard"
          element={
            <ProtectedRoute role="station_owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute role="station_owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DeviceManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stations"
          element={
            <ProtectedRoute role="admin">
              <AllStations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/nearby"
          element={
            <ProtectedRoute role="admin">
              <NearbyStations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute role="admin">
              <AllBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <ProtectedRoute role="admin">
              <AdminSecurity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/monitoring"
          element={
            <ProtectedRoute role="admin">
              <AdminMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/soc"
          element={
            <ProtectedRoute role="admin">
              <SOCDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
