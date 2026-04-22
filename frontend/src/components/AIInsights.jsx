import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/ai-components.css";

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [tips, setTips] = useState([]);
  const [nextOptimalTime, setNextOptimalTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    fetchTips();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get("/ai/dashboard-insights");
      setInsights(res.data.insights || []);
      setNextOptimalTime(res.data.next_optimal_time || "");
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await api.get("/ai/quick-tips");
      setTips(res.data.tips || []);
    } catch (error) {
      console.error("Error fetching tips:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  if (isLoading) {
    return (
      <div className="ai-insights-container loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Insights...</p>
      </div>
    );
  }

  return (
    <div className="ai-insights-container">
      <div className="insights-header">
        <h3>🎯 AI Insights</h3>
        {nextOptimalTime && (
          <div className="optimal-time">
            <span>Next Optimal: </span>
            <strong>{nextOptimalTime}</strong>
          </div>
        )}
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`insight-card ${insight.type}`}
            style={{ borderLeftColor: getPriorityColor(insight.priority) }}
          >
            <span className="insight-icon">{insight.icon}</span>
            <div className="insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.message}</p>
            </div>
          </div>
        ))}
      </div>

      {tips.length > 0 && (
        <div className="tips-section">
          <h4>💡 Quick Tips</h4>
          <div className="tips-carousel">
            {tips.map((tip, index) => (
              <div key={index} className="tip-card">
                <span className="tip-icon">{tip.icon}</span>
                <div className="tip-content">
                  <span className="tip-category">{tip.category}</span>
                  <p>{tip.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
