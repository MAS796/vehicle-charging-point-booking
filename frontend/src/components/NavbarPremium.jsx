import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/navbar-pro.css";

export default function NavbarPremium() {
  const MotionNav = motion.nav;
  return (
    <MotionNav
      className="navbar-pro"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="logo">⚡ EV Smart</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
      </div>
    </MotionNav>
  );
}
