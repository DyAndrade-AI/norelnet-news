import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

// Configuración centralizada de sesión para que Express y Redis hablen el mismo idioma.

// Valores por defecto seguros para desarrollo cuando las variables de entorno no existen.
const {
  SESSION_NAME = "sid",
  SESSION_SECRET = "change-me",
  SESSION_DOMAIN,
  SESSION_SECURE = "false",
  SESSION_SAMESITE = "lax",
  SESSION_MAXAGE_MS = "86400000", // 24 horas
  REDIS_URL = "redis://127.0.0.1:6379",
  TRUST_PROXY = "false",
} = process.env;

export const redisClient = createClient({ url: REDIS_URL });
redisClient.on("error", (err) => console.error("Redis Client Error", err));

await redisClient.connect();

const store = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

export function trustProxy(app) {
  // Solo se activa cuando desplegamos detrás de un balanceador (Heroku, Render, etc.)
  if (TRUST_PROXY === "true") app.set("trust proxy", 1);
}

const parsedMaxAge = Number.parseInt(SESSION_MAXAGE_MS, 10);

export const sessionMiddleware = session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    secure: SESSION_SECURE === "true",
    sameSite: SESSION_SAMESITE || "lax",
    maxAge: Number.isNaN(parsedMaxAge) ? 86400000 : parsedMaxAge,
    domain: SESSION_DOMAIN || undefined,
  },
});
