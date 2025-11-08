import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

// Maneja registro/login y endpoints relacionados con la sesión.

const r = Router();

// Utilidad para 'promisificar' regenerate
function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
}

r.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Faltan campos" });

    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) return res.status(409).json({ error: "Ya existe" });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email: email.toLowerCase(), passwordHash, name, role: "viewer" });

    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

r.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

    const u = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!u) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    await regenerateSession(req);

    // Sesión mínima y segura
    req.session.user = { id: String(u._id), role: u.role };

    return res.json({ ok: true, user: { role: u.role } });
  } catch (err) {
    return next(err);
  }
});

r.post("/logout", async (req, res) => {
  // destroy no usa next, y respondemos una sola vez
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_NAME || "sid");
    return res.json({ ok: true });
  });
});

r.get("/me", (req, res) => {
  // devolvemos solo lo que hay en sesión (id/role)
  return res.json({ user: req.session.user || null });
});

export default r;
