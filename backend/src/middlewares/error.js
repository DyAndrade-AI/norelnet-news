// Manejo de errores: responde una sola vez
export function error(err, req, res, next) {
  // Si ya se enviaron headers, delega al manejador por defecto de Express
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ error: message });
}
