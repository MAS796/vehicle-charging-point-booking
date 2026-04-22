import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PricingSection() {
  const MotionDiv = motion.div;
  const [stats, setStats] = useState({
    active_sessions: 18,
    current_load_kw: 240,
    energy_today_kwh: 1200
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        active_sessions: Math.floor(Math.random() * 30) + 10,
        current_load_kw: Math.floor(Math.random() * 200) + 150,
        energy_today_kwh: Math.floor(Math.random() * 4000) + 1000
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const plans = [
    {
      name: "Starter",
      price: 0,
      features: ["Basic booking", "Standard support", "Mobile app access"]
    },
    {
      name: "Pro",
      price: 19,
      features: ["AI optimization", "Advanced analytics", "Priority support", "API access"],
      featured: true
    }
  ];

  return (
    <section className="pricing-section">
      <h2>SaaS Pricing Plans</h2>
      <div className="pricing-grid">
        {plans.map((plan, idx) => (
          <MotionDiv
            key={idx}
            className={`plan glass ${plan.featured ? "featured" : ""}`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>{plan.name}</h3>
            <p className="price">${plan.price} / month</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
            <button className="cta-btn">Get Started</button>
          </MotionDiv>
        ))}
      </div>

      <MotionDiv
        className="dashboard-preview glass"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <h3>Live Charging Analytics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-label">Active Sessions</p>
            <p className="stat-value">{stats.active_sessions}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Current Load</p>
            <p className="stat-value">{stats.current_load_kw} kW</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Energy Today</p>
            <p className="stat-value">{stats.energy_today_kwh} kWh</p>
          </div>
        </div>
      </MotionDiv>
    </section>
  );
}
