import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import dotenv from "dotenv";

// Configuración centralizada de sesión para que Express y Redis hablen el mismo idioma.
dotenv.config();

const SESSION_NAME = process.env.SESSION_NAME || "norelnet.sid";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me";
const SESSION_DOMAIN = process.env.SESSION_DOMAIN || undefined;
const SESSION_SECURE = process.env.SESSION_SECURE === "true";
const SESSION_SAMESITE = process.env.SESSION_SAMESITE || "lax";
const SESSION_MAXAGE_MS =
  Number.parseInt(process.env.SESSION_MAXAGE_MS ?? "", 10) ||
  1000 * 60 * 60 * 24 * 14; // 14 días
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const TRUST_PROXY = process.env.TRUST_PROXY === "true";

export const SESSION_COOKIE_NAME = SESSION_NAME;
export const SESSION_COOKIE_OPTIONS = {
  path: "/",
  domain: SESSION_DOMAIN,
  sameSite: SESSION_SAMESITE,
  secure: SESSION_SECURE,
  httpOnly: true
};

export const redisClient = createClient({ url: REDIS_URL });
redisClient.on("error", (err) => console.error("Redis Client Error", err));

await redisClient.connect();

const store = new RedisStore({
  client: redisClient,
  prefix: "sess:",
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
    maxAge: SESSION_MAXAGE_MS,
    domain: SESSION_DOMAIN,
  },
});
