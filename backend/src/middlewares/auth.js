import { redisClient, SESSION_PREFIX, SESSION_NAME } from "./session.js";

function respondUnauthorized(res) {
  return res.status(401).json({ error: "No autenticado" });
}

async function loadUserFromRedis(sessionId) {
  const rawSession = await redisClient.get(`${SESSION_PREFIX}${sessionId}`);
  if (!rawSession) return null;

  const parsed = JSON.parse(rawSession);
  return parsed.user || null;
}

export async function requireAuth(req, res, next) {
  try {
    if (req.session?.user) {
      req.user = req.session.user;
      return next();
    }

    // Fallback para clientes que envían el ID de sesión en header
    const sessionId =
      req.sessionID ||
      req.headers["x-session-id"] ||
      req.headers["x-sessionid"] ||
      req.cookies?.[SESSION_NAME];

    if (!sessionId) return respondUnauthorized(res);

    const user = await loadUserFromRedis(sessionId);
    if (!user) return respondUnauthorized(res);

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user?.rol !== "admin") {
      return res
        .status(403)
        .json({ error: "Acceso denegado: se requiere rol admin" });
    }
    next();
  });
}

export function requireEditor(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (!["editor", "admin"].includes(req.user?.rol)) {
      return res
        .status(403)
        .json({ error: "Acceso denegado: se requiere rol editor o admin" });
    }
    next();
  });
}
