import { Link, NavLink } from "react-router-dom";

// Navbar simple para sitio de noticias
export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="logo">
          Norelnet News
        </Link>

        <nav className="links">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/news">Todas las noticias</NavLink>
        </nav>
      </div>
    </header>
  );
}
