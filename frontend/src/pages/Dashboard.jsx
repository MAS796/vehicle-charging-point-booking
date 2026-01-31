import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";
import { Helmet } from "react-helmet";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/dashboard?days=${days}`);
      setStats(res.data);
    } catch (err) {
      setError("Failed to load dashboard: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading dashboard...</p></div>;
  if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;
  if (!stats) return <div className="container"><p>No data available</p></div>;

  // Prepare data for charts
  const chargingTypeData = [
    { name: "AC Chargers", value: stats.ac_bookings },
    { name: "DC Chargers", value: stats.dc_bookings }
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"];

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | EV Charging Platform</title>
        <meta name="description" content="View comprehensive analytics and insights about EV charging stations and bookings." />
      </Helmet>

      <div className="dashboard">
        <h1>📊 Analytics Dashboard</h1>

        {/* Time Period Selector */}
        <div className="time-selector">
          <label>Time Period: </label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 1 year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📱</div>
            <div className="metric-info">
              <h3>Total Bookings</h3>
              <p className="metric-value">{stats.total_bookings}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🏢</div>
            <div className="metric-info">
              <h3>Total Companies</h3>
              <p className="metric-value">{stats.total_companies}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👁️</div>
            <div className="metric-info">
              <h3>Total Views</h3>
              <p className="metric-value">{stats.total_views}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-info">
              <h3>AC Chargers Booked</h3>
              <p className="metric-value">{stats.ac_bookings}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🔋</div>
            <div className="metric-info">
              <h3>DC Chargers Booked</h3>
              <p className="metric-value">{stats.dc_bookings}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Charging Type Distribution */}
          <div className="chart-card">
            <h3>AC vs DC Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chargingTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chargingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Companies */}
          <div className="chart-card">
            <h3>Top 5 Companies by Views</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_companies}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Stations */}
          <div className="chart-card">
            <h3>Most Booked Stations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_stations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country Distribution */}
          <div className="chart-card">
            <h3>Country-wise Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.country_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" name="Companies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="tables-section">
          <div className="table-card">
            <h3>Top Companies</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Views</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>{company.views}</td>
                    <td>{company.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-card">
            <h3>Country Distribution</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Companies</th>
                </tr>
              </thead>
              <tbody>
                {stats.country_distribution.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.country}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
