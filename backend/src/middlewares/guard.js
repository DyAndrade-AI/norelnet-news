// Middlewares de autorización reutilizados por rutas protegidas
function attachUser(req) {
  if (!req.session?.user) return null;
  if (!req.user) req.user = req.session.user;
  return req.user;
}

export function requireAuth(req, res, next) {
  const user = attachUser(req);
  if (user) return next();
  return res.status(401).json({ error: "No autenticado" });
}

export function requireEditor(req, res, next) {
  const user = attachUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado" });

  const rol = user.rol;
  // Editor y admin pueden modificar catálogo; reuse en endpoints de productos/categorías
  if (rol === "editor" || rol === "admin") return next();
  return res.status(403).json({ error: "Sin permisos" });
}

export function requireAdmin(req, res, next) {
  const user = attachUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado" });

  // Úsalo en endpoints de administración de usuarios/configuración
  if (user.rol === "admin") return next();
  return res.status(403).json({ error: "Solo admin" });
}
