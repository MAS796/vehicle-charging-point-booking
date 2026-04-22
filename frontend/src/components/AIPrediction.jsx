import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/ai-components.css";

const AIPrediction = () => {
  const [load, setLoad] = useState(50);
  const [prediction, setPrediction] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [activeTab, setActiveTab] = useState("wait");
  const [isLoading, setIsLoading] = useState(false);

  // Charging estimate form
  const [batteryCapacity, setBatteryCapacity] = useState(40);
  const [currentSoc, setCurrentSoc] = useState(20);
  const [targetSoc, setTargetSoc] = useState(80);
  const [chargerPower, setChargerPower] = useState(50);
  const [chargeEstimate, setChargeEstimate] = useState(null);

  const predictWaitTime = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/ai/predict-wait?load=${load}`);
      setPrediction(res.data);
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getForecast = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/ai/forecast?hours=12");
      setForecast(res.data.forecast || []);
    } catch (error) {
      console.error("Forecast error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateChargeTime = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/ai/charging-estimate", {
        battery_capacity_kwh: batteryCapacity,
        current_soc: currentSoc,
        target_soc: targetSoc,
        charger_power_kw: chargerPower
      });
      setChargeEstimate(res.data);
    } catch (error) {
      console.error("Estimate error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "forecast") {
      getForecast();
    }
  }, [activeTab]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Low Traffic": return "#10b981";
      case "Moderate Traffic": return "#f59e0b";
      case "High Traffic": return "#f97316";
      case "Very High Traffic": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <div className="ai-prediction-container">
      <div className="prediction-header">
        <h3>🤖 AI Predictions</h3>
        <div className="tab-buttons">
          <button 
            className={activeTab === "wait" ? "active" : ""}
            onClick={() => setActiveTab("wait")}
          >
            Wait Time
          </button>
          <button 
            className={activeTab === "forecast" ? "active" : ""}
            onClick={() => setActiveTab("forecast")}
          >
            Forecast
          </button>
          <button 
            className={activeTab === "estimate" ? "active" : ""}
            onClick={() => setActiveTab("estimate")}
          >
            Charge Time
          </button>
        </div>
      </div>

      {/* Wait Time Prediction Tab */}
      {activeTab === "wait" && (
        <div className="prediction-content">
          <div className="input-group">
            <label>Station Load: {load}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={load}
              onChange={(e) => setLoad(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Empty</span>
              <span>Moderate</span>
              <span>Full</span>
            </div>
          </div>

          <button onClick={predictWaitTime} disabled={isLoading} className="predict-btn">
            {isLoading ? "Analyzing..." : "Predict Wait Time"}
          </button>

          {prediction && (
            <div className="prediction-result">
              <div className="result-card main">
                <span className="result-label">Estimated Wait</span>
                <span className="result-value">{prediction.predicted_wait_minutes} min</span>
              </div>
              
              <div className="result-card">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(prediction.status) }}
                >
                  {prediction.status}
                </span>
              </div>

              <div className="result-card">
                <span className="result-label">Confidence</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="confidence-text">{Math.round(prediction.confidence * 100)}%</span>
              </div>

              <div className="recommendation-box">
                <span className="rec-icon">💡</span>
                <p>{prediction.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Demand Forecast Tab */}
      {activeTab === "forecast" && (
        <div className="prediction-content">
          <div className="forecast-grid">
            {forecast.slice(0, 8).map((item, index) => (
              <div key={index} className="forecast-card">
                <div className="forecast-time">
                  {new Date(item.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="forecast-bar-container">
                  <div 
                    className="forecast-bar"
                    style={{ 
                      height: `${item.predicted_load}%`,
                      backgroundColor: item.predicted_load > 70 ? '#ef4444' : 
                                      item.predicted_load > 50 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
                <div className="forecast-load">{Math.round(item.predicted_load)}%</div>
                <div className="forecast-price">{item.price_indicator}</div>
              </div>
            ))}
          </div>
          
          {forecast.length > 0 && (
            <div className="forecast-legend">
              <span className="legend-item"><span className="dot green"></span> Low Demand</span>
              <span className="legend-item"><span className="dot yellow"></span> Moderate</span>
              <span className="legend-item"><span className="dot red"></span> High Demand</span>
            </div>
          )}
        </div>
      )}

      {/* Charging Time Estimate Tab */}
      {activeTab === "estimate" && (
        <div className="prediction-content">
          <div className="estimate-form">
            <div className="form-group">
              <label>Battery Capacity (kWh)</label>
              <input
                type="number"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                min="10"
                max="150"
              />
            </div>
            
            <div className="form-group">
              <label>Current Charge: {currentSoc}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSoc}
                onChange={(e) => setCurrentSoc(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="form-group">
              <label>Target Charge: {targetSoc}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={targetSoc}
                onChange={(e) => setTargetSoc(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="form-group">
              <label>Charger Power (kW)</label>
              <select value={chargerPower} onChange={(e) => setChargerPower(Number(e.target.value))}>
                <option value="7.4">AC Slow (7.4 kW)</option>
                <option value="22">AC Fast (22 kW)</option>
                <option value="50">DC Fast (50 kW)</option>
                <option value="120">DC Rapid (120 kW)</option>
                <option value="150">DC Ultra (150 kW)</option>
              </select>
            </div>

            <button onClick={calculateChargeTime} disabled={isLoading} className="predict-btn">
              {isLoading ? "Calculating..." : "Calculate"}
            </button>
          </div>

          {chargeEstimate && (
            <div className="estimate-result">
              <div className="result-card main">
                <span className="result-label">Charging Time</span>
                <span className="result-value">{chargeEstimate.estimated_time_formatted}</span>
              </div>
              
              <div className="result-row">
                <div className="result-card">
                  <span className="result-label">Energy Needed</span>
                  <span className="result-value small">{chargeEstimate.energy_needed_kwh} kWh</span>
                </div>
                <div className="result-card">
                  <span className="result-label">Est. Cost</span>
                  <span className="result-value small">₹{chargeEstimate.cost_estimate_inr}</span>
                </div>
              </div>

              <div className="result-card">
                <span className="result-label">Rate Type</span>
                <span className={`rate-badge ${chargeEstimate.rate_type.toLowerCase()}`}>
                  {chargeEstimate.rate_type}
                </span>
                <span className="rate-info">₹{chargeEstimate.rate_per_kwh}/kWh</span>
              </div>

              <div className="result-card">
                <span className="result-label">Completion Time</span>
                <span className="completion-time">{chargeEstimate.completion_time}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPrediction;
