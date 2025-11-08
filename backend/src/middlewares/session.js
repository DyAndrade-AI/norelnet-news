import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

// Configuración centralizada de sesión para que Express y Redis hablen el mismo idioma.

const {
  SESSION_NAME = `${SESSION_NAME}`,
  SESSION_SECRET = `${SESSION_SECRET}`,
  SESSION_DOMAIN,
  SESSION_SECURE = `${SESSION_SECURE}`,
  SESSION_SAMESITE = `${SESSION_SAMESITE}`,
  SESSION_MAXAGE_MS = `${SESSION_MAXAGE_MS}`,
  REDIS_URL = `${REDIS_URL}`,
  TRUST_PROXY = `${TRUST_PROXY}`,
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

export const sessionMiddleware = session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,
    secure: SESSION_SECURE === "true",
    sameSite: SESSION_SAMESITE, 
    maxAge: parseInt(SESSION_MAXAGE_MS, 10),
    domain: SESSION_DOMAIN || undefined, 
  },
});
