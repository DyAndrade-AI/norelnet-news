import { useState, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import MenuSearch from "./MenuSearch";
import { useEditor } from "../context/EditorContext";

// Header principal: combina navegación pública + accesos al modo editor/admin.
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const { user, isEditor, isAdmin, logout } = useEditor();

  const closeMenu = useCallback(() => setOpen(false), []);
  const openEditorPanel = useCallback(() => {
    // Disparamos eventos para comunicar al FAB flotante sin acoplar componentes
    document.dispatchEvent(new CustomEvent("open-editor-panel"));
  }, []);

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="logo" onClick={closeMenu}>
          NorelNet News
        </Link>

        <div className="nav-search">
          <MenuSearch placeholder="Buscar en NorelNet News…" />
        </div>

        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
          <span />
          <span />
          <span />
        </button>

        <nav className={`links ${open ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Portada</NavLink>
          <NavLink to="/menu" onClick={closeMenu}>Archivo</NavLink>
          <a href="/#ultimas" onClick={closeMenu}>Últimas</a>
          <a href="/#analisis" onClick={closeMenu}>Análisis</a>
          <a href="/#visuales" onClick={closeMenu}>Video</a>
          <a href="/#boletin" onClick={closeMenu}>Newsletter</a>
          <NavLink to="/reservations" onClick={closeMenu}>Contacto</NavLink>

          {!user ? (
            <button className="nav-btn" onClick={() => setOpenAuth(true)}>
              Iniciar sesión / Crear cuenta
            </button>
          ) : (
            <>
              {isEditor && (
                <button className="nav-btn" onClick={openEditorPanel}>
                  Editar
                </button>
              )}
              {isAdmin && (
                <button className="nav-btn" onClick={() => setOpenAdmin(true)}>
                  Gestionar usuarios
                </button>
              )}
              <button className="nav-btn" onClick={logout}>
                Salir
              </button>
            </>
          )}
        </nav>
      </div>

      {openAuth && <AuthModal onClose={() => setOpenAuth(false)} />}
      {openAdmin && isAdmin && <AdminUsersModal onClose={() => setOpenAdmin(false)} />}
    </header>
  );
}

/* ---------- MODAL LOGIN / REGISTER ---------- */
function AuthModal({ onClose }) {
  const { login, register } = useEditor();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleInputChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === "login" ? "register" : "login");
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) {
          setError("El nombre es requerido");
          setLoading(false);
          return;
        }
        await register(form.email, form.password, form.name);
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <h3 style={{ marginTop: 0 }}>
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h3>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: "8px" }}>
          {!isLogin && (
            <input
              className="inp"
              placeholder="Nombre"
              value={form.name}
              onChange={handleInputChange("name")}
              required={!isLogin}
              disabled={loading}
            />
          )}
          <input
            className="inp"
            placeholder="Correo electrónico"
            type="email"
            value={form.email}
            onChange={handleInputChange("email")}
            required
            disabled={loading}
          />
          <input
            className="inp"
            placeholder="Contraseña"
            type="password"
            value={form.password}
            onChange={handleInputChange("password")}
            required
            disabled={loading}
            minLength={6}
          />
          {error && <p className="err">{error}</p>}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Procesando..." : (isLogin ? "Entrar" : "Registrarme")}
          </button>
        </form>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <button onClick={toggleMode} className="btn sm" disabled={loading}>
            {isLogin ? "Crear cuenta nueva" : "Ya tengo cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- MODAL ADMIN: ASIGNAR ROL ---------- */
function AdminUsersModal({ onClose }) {
  const { searchUsers, grantRole } = useEditor();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const buscar = useCallback(async () => {
    if (!q.trim()) return;
    
    setLoading(true);
    setMsg("");
    try {
      const { items } = await searchUsers({ q, limit: 20 });
      setUsers(items || []);
    } catch (err) {
      setMsg("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  }, [q, searchUsers]);

  const toggleRole = useCallback(async (userId, currentRole) => {
    setMsg("");
    try {
      const newRole = currentRole === "editor" ? "viewer" : "editor";
      await grantRole(userId, newRole);
      setMsg(`Rol actualizado a ${newRole}`);
      await buscar();
    } catch (err) {
      setMsg("Error al actualizar rol");
    }
  }, [grantRole, buscar]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") buscar();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <h3 style={{ marginTop: 0 }}>Gestionar usuarios</h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            className="inp"
            placeholder="Buscar por email o nombre"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button className="btn" onClick={buscar} disabled={loading || !q.trim()}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {msg && (
          <p style={{ color: msg.includes("Error") ? "#ef4444" : "#a3e635" }}>
            {msg}
          </p>
        )}
        {users.length > 0 && (
          <ul className="grid" style={{ gap: "6px", maxHeight: "50vh", overflow: "auto" }}>
            {users.map((u) => {
              const userId = u._id || u.id;
              const isEditor = u.role === "editor";
              
              return (
                <li key={userId} className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    {u.name || "(sin nombre)"} — {u.email} — {u.role}
                  </span>
                  <button 
                    className="btn sm" 
                    onClick={() => toggleRole(userId, u.role)}
                  >
                    {isEditor ? "Quitar editor" : "Hacer editor"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {!loading && users.length === 0 && q && (
          <p style={{ textAlign: "center", color: "#999" }}>
            No se encontraron usuarios
          </p>
        )}
      </div>
    </div>
  );
}
