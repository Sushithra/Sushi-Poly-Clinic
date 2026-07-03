// Shared header placeholder.
// Future responsibility: provide adaptive top navigation with mobile menu entry,
// tablet-safe spacing, and desktop expansion without increasing interaction complexity.

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="ui-header">
      <Link to="/" className="ui-brand">
        Eclinic
      </Link>
      <nav className="ui-header-links" aria-label="Primary">
        <Link to="/doctors">Doctors</Link>
        <Link to="/pharmacy">Pharmacy</Link>
        <Link to="/appointments">Appointments</Link>
      </nav>
    </header>
  );
}
