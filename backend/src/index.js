
import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./database.js";
import productRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import menuRouter from "./routes/menu.js";
import { sessionMiddleware, trustProxy } from "./middlewares/session.js";
import authRouter from "./routes/auth.js";
import { error } from "./middlewares/error.js";
import mongoose from "mongoose";
import usersRouter from "./routes/users.js";
import bootstrapRouter from "./routes/bootstrap.js";

// Punto de entrada de la API: configura middlewares y monta cada router.

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.use(express.json());
app.use(morgan("dev"));

// Permite respetar cabeceras X-Forwarded-* cuando corremos detrás de un proxy
trustProxy(app);
app.use(sessionMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/menu", menuRouter);
app.use("/api/users", usersRouter);
// Reutilizamos el prefijo /api/auth para exponer el bootstrap inicial de admin
app.use("/api/auth", bootstrapRouter);

app.use(error);

const port = process.env.PORT || 3000;
const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(port, () => console.log(`API http://localhost:${port}`));
};
start();
