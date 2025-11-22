export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ error: "Error de validación", details: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Registro duplicado" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json({ error: message });
}
