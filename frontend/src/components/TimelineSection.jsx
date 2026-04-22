import { motion } from "framer-motion";

export default function TimelineSection() {
  const MotionDiv = motion.div;
  const steps = [
    "Find nearby stations",
    "Reserve slot instantly",
    "AI predicts best charge time",
    "Charge & pay securely"
  ];

  return (
    <section className="timeline-section">
      <h2>How It Works</h2>
      <div className="timeline-container">
        {steps.map((step, index) => (
          <MotionDiv
            key={index}
            className="timeline-item"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: index * 0.2 }}
            viewport={{ once: false, amount: 0.5 }}
          >
            <div className="timeline-number">{index + 1}</div>
            <div className="timeline-content">
              <p>{step}</p>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
