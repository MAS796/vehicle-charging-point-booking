import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Rahul", message: "Amazing charging experience! Seamless booking." },
  { name: "Ananya", message: "Best EV platform I've used. Highly recommended!" },
  { name: "Vikram", message: "AI prediction saved me hours. Outstanding service!" }
];

export default function Testimonials() {
  const MotionDiv = motion.div;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="testimonials-section">
      <h2>What Users Say</h2>
      <MotionDiv
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8 }}
        className="testimonial glass"
      >
        <p>"{testimonials[index].message}"</p>
        <h4>— {testimonials[index].name}</h4>
      </MotionDiv>
      <div className="testimonial-dots">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
