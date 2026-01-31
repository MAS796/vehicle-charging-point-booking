import { Helmet } from "react-helmet";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "../styles/insights.css";

export default function Insights() {
  // Sample EV Market Data
  const evMarketGrowth = [
    { year: 2018, adoptionRate: 2.1, stations: 45000 },
    { year: 2019, adoptionRate: 2.4, stations: 52000 },
    { year: 2020, adoptionRate: 3.1, stations: 71000 },
    { year: 2021, adoptionRate: 4.2, stations: 95000 },
    { year: 2022, adoptionRate: 5.5, stations: 145000 },
    { year: 2023, adoptionRate: 7.2, stations: 210000 },
    { year: 2024, adoptionRate: 9.8, stations: 310000 },
    { year: 2025, adoptionRate: 12.5, stations: 450000 }
  ];

  const indiaEvStats = [
    { quarter: "Q1 2023", sales: 145, stations: 2500 },
    { quarter: "Q2 2023", sales: 182, stations: 2800 },
    { quarter: "Q3 2023", sales: 228, stations: 3200 },
    { quarter: "Q4 2023", sales: 312, stations: 4100 },
    { quarter: "Q1 2024", sales: 425, stations: 5200 },
    { quarter: "Q2 2024", sales: 568, stations: 6800 },
    { quarter: "Q3 2024", sales: 742, stations: 8500 },
    { quarter: "Q4 2024", sales: 945, stations: 10500 }
  ];

  const chargingTypeGrowth = [
    { year: 2020, AC: 65, DC: 35 },
    { year: 2021, AC: 62, DC: 38 },
    { year: 2022, AC: 58, DC: 42 },
    { year: 2023, AC: 52, DC: 48 },
    { year: 2024, AC: 45, DC: 55 },
    { year: 2025, AC: 38, DC: 62 }
  ];

  const globalStats = [
    { region: "Europe", stations: 185000, percentage: 42 },
    { region: "China", stations: 120000, percentage: 27 },
    { region: "USA", stations: 95000, percentage: 22 },
    { region: "India", stations: 35000, percentage: 8 },
    { region: "Others", stations: 15000, percentage: 1 }
  ];

  return (
    <>
      <Helmet>
        <title>EV Market Insights & Analytics | Industry Analysis</title>
        <meta
          name="description"
          content="Explore comprehensive EV market trends, adoption rates, global charging station statistics, and industry forecasts."
        />
      </Helmet>

      <div className="insights-page">
        <h1>📈 EV Market Insights & Analytics</h1>
        <p className="page-subtitle">Global Electric Vehicle Industry Analysis & Trends</p>

        {/* Key Statistics */}
        <div className="stats-boxes">
          <div className="stat-box">
            <h3>Global EV Sales (2024)</h3>
            <p className="stat-number">14.3M</p>
            <p className="stat-label">vehicles sold</p>
          </div>
          <div className="stat-box">
            <h3>Charging Stations (2024)</h3>
            <p className="stat-number">450K+</p>
            <p className="stat-label">worldwide</p>
          </div>
          <div className="stat-box">
            <h3>Market Growth (YoY)</h3>
            <p className="stat-number">+18.5%</p>
            <p className="stat-label">year-over-year</p>
          </div>
          <div className="stat-box">
            <h3>India EV Market</h3>
            <p className="stat-number">12.8%</p>
            <p className="stat-label">CAGR 2021-2030</p>
          </div>
        </div>

        {/* Global EV Market Growth */}
        <section className="insight-section">
          <h2>🌍 Global EV Adoption Rate & Charging Infrastructure</h2>
          <p className="section-description">
            The global EV market is experiencing exponential growth. Adoption rates are projected to reach 
            12.5% in 2025, with charging infrastructure expanding to meet demand.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={evMarketGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdoption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="adoptionRate"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorAdoption)"
                name="Adoption Rate (%)"
              />
              <Bar yAxisId="right" dataKey="stations" fill="#82ca9d" name="Charging Stations" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* India EV Growth */}
        <section className="insight-section">
          <h2>🇮🇳 India EV Market Growth (2023-2024)</h2>
          <p className="section-description">
            India's EV market shows strong growth trajectory with increasing vehicle sales and 
            rapid expansion of charging infrastructure. Government initiatives like FAME scheme 
            are driving adoption.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={indiaEvStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" fill="#667eea" name="EV Sales (Thousands)" />
              <Bar yAxisId="right" dataKey="stations" fill="#ffc658" name="Charging Stations" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* AC vs DC Trend */}
        <section className="insight-section">
          <h2>⚡ AC vs DC Charging Technology Trends</h2>
          <p className="section-description">
            DC fast charging is becoming the industry standard. By 2025, DC chargers are expected 
            to dominate 62% of the market, reflecting growing demand for rapid charging solutions.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chargingTypeGrowth} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="AC"
                stroke="#8884d8"
                strokeWidth={2}
                name="AC Chargers (%)"
              />
              <Line
                type="monotone"
                dataKey="DC"
                stroke="#82ca9d"
                strokeWidth={2}
                name="DC Chargers (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Global Distribution */}
        <section className="insight-section">
          <h2>🗺️ Global Charging Station Distribution</h2>
          <p className="section-description">
            Europe leads with 42% of global charging infrastructure, followed by China at 27%. 
            India is emerging as a key growth market with rapid expansion.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={globalStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="stations" fill="#667eea" name="Stations (Thousands)" />
              <Bar yAxisId="right" dataKey="percentage" fill="#ff7c7c" name="Global Share (%)" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Key Insights */}
        <section className="insights-grid">
          <div className="insight-card">
            <h3>🔋 Battery Technology</h3>
            <p>
              Solid-state batteries coming 2026 will increase range by 80% and reduce 
              charging time to under 10 minutes.
            </p>
          </div>

          <div className="insight-card">
            <h3>💰 Cost Reduction</h3>
            <p>
              EV prices expected to reach parity with ICE vehicles by 2027, accelerating 
              mass market adoption globally.
            </p>
          </div>

          <div className="insight-card">
            <h3>🌱 Sustainability</h3>
            <p>
              Renewable energy integration in charging networks expected to reach 75% by 2030, 
              making EVs truly carbon-neutral.
            </p>
          </div>

          <div className="insight-card">
            <h3>🏢 Infrastructure Investment</h3>
            <p>
              Global investment in EV infrastructure projected to reach $250B by 2030, 
              creating 2.5M new jobs.
            </p>
          </div>

          <div className="insight-card">
            <h3>🚗 Vehicle Types</h3>
            <p>
              Commercial EVs and trucks will dominate 40% of growth. India focusing on 
              electric 3-wheelers for last-mile connectivity.
            </p>
          </div>

          <div className="insight-card">
            <h3>📱 Smart Mobility</h3>
            <p>
              AI-powered charging networks will optimize power distribution. Mobile apps 
              will provide real-time availability and dynamic pricing.
            </p>
          </div>
        </section>

        {/* Forecast */}
        <section className="forecast-section">
          <h2>🔮 Industry Forecast (2025-2030)</h2>
          <div className="forecast-grid">
            <div className="forecast-item">
              <span className="forecast-year">2025</span>
              <div className="forecast-content">
                <h4>15-20M EV Sales</h4>
                <p>EVs reach 15-20% market share in developed markets</p>
              </div>
            </div>
            <div className="forecast-item">
              <span className="forecast-year">2026</span>
              <div className="forecast-content">
                <h4>Solid-State Batteries</h4>
                <p>First commercial solid-state batteries in premium EVs</p>
              </div>
            </div>
            <div className="forecast-item">
              <span className="forecast-year">2027</span>
              <div className="forecast-content">
                <h4>Price Parity</h4>
                <p>EV prices reach parity with traditional combustion engines</p>
              </div>
            </div>
            <div className="forecast-item">
              <span className="forecast-year">2030</span>
              <div className="forecast-content">
                <h4>50M+ Annual Sales</h4>
                <p>EVs dominate global automotive market with 50M+ annual sales</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
