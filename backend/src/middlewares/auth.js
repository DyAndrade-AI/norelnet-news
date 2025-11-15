// Middlewares de autenticación/autorización basados en la sesión de Express.

function ensureSessionUser(req) {
  if (req.user) return req.user;
  const sessionUser = req.session?.user;
  if (sessionUser) {
    req.user = sessionUser;
    return sessionUser;
  }
  return null;
}

export function requireAuth(req, res, next) {
  const user = ensureSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

export function requireEditor(req, res, next) {
  requireAuth(req, res, () => {
    if (!["editor", "admin"].includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  });
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo administradores" });
    }
    next();
  });
}

export function requireSelfOrAdmin(param = "id") {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (req.user.rol === "admin") {
        return next();
      }
      if (req.user._id?.toString() === req.params?.[param]) {
        return next();
      }
      return res.status(403).json({ error: "Acceso denegado" });
    });
  };
}
