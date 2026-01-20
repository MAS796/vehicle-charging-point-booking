import { Link } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
  return (
    <header className="header">
      <h2>⚡ EV Charging</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}
