import { Link } from "react-router-dom";

// Mobile bottom navigation placeholder.
// Future responsibility: provide touch-friendly primary navigation for phone-sized viewports.
export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      <Link to="/">Home</Link>
      <Link to="/appointments">Appointments</Link>
      <Link to="/consultations">Consult</Link>
      <Link to="/pharmacy">Store</Link>
    </nav>
  );
}
