import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import dotenv from "dotenv";

// Cargar variables de entorno antes de leerlas en este módulo
dotenv.config();

// Valores por defecto seguros para desarrollo cuando las variables de entorno no existen.
export const SESSION_NAME = process.env.SESSION_NAME || "sid";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me";
const SESSION_DOMAIN = process.env.SESSION_DOMAIN;
const SESSION_SECURE = process.env.SESSION_SECURE === "true";
const SESSION_SAMESITE = process.env.SESSION_SAMESITE || "lax";
const SESSION_MAXAGE_MS = Number.parseInt(process.env.SESSION_MAXAGE_MS || "86400000", 10); // 24h
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const SESSION_PREFIX = process.env.SESSION_PREFIX || "sess:";
const TRUST_PROXY = process.env.TRUST_PROXY === "true";

export const redisClient = createClient({ url: REDIS_URL });
redisClient.on("error", (err) => console.error("Redis Client Error", err));

try {
  await redisClient.connect();
} catch (err) {
  console.error("No se pudo conectar a Redis", err);
  throw err;
}

const store = new RedisStore({
  client: redisClient,
  prefix: SESSION_PREFIX,
});

export function trustProxy(app) {
  // Solo se activa cuando desplegamos detrás de un balanceador (Heroku, Render, etc.)
  if (TRUST_PROXY) app.set("trust proxy", 1);
}

export const sessionMiddleware = session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    secure: SESSION_SECURE,
    sameSite: SESSION_SAMESITE,
    maxAge: Number.isNaN(SESSION_MAXAGE_MS) ? 86400000 : SESSION_MAXAGE_MS,
    domain: SESSION_DOMAIN || undefined,
  },
});

// Exportar el store por si necesitamos manipular sesiones manualmente
export const redisStore = store;
