// Middlewares de autorización reutilizados por rutas protegidas
export function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ error: "No autenticado" });
}
export function requireEditor(req, res, next) {
  const r = req.session?.user?.role;
  // Editor y admin pueden modificar catálogo; reuse en endpoints de productos/categorías
  if (r === "editor" || r === "admin") return next();
  return res.status(403).json({ error: "Sin permisos" });
}
export function requireAdmin(req, res, next) {
  // Úsalo en endpoints de administración de usuarios/configuración
  if (req.session?.user?.role === "admin") return next();
  return res.status(403).json({ error: "Solo admin" });
}
