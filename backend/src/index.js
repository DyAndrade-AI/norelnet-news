
import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./database.js";
import { connectCassandra } from "./database-cassandra.js";
import { sessionMiddleware, trustProxy } from "./middlewares/session.js";
import { errorHandler } from "./middlewares/error.js";
import mongoose from "mongoose";
import usersRouter from "./routes/users.js";
import articlesRouter from "./routes/articles.js";
import authRouter from "./routes/auth.js";
import interactionsRouter from "./routes/interactions.js";
import homeRouter from "./routes/home.js";

// Punto de entrada de la API: configura middlewares y monta cada router.

dotenv.config();

const app = express();

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
];
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Permite respetar cabeceras X-Forwarded-* cuando corremos detrás de un proxy
trustProxy(app);
app.use(sessionMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/interactions", interactionsRouter);
app.use("/api/home", homeRouter);

app.use(errorHandler);

const port = process.env.PORT || 3000;
const start = async () => {
  await connectDB(process.env.MONGO_URI);
  await connectCassandra();
  app.listen(port, () => console.log(`API http://localhost:${port}`));
};
start();
