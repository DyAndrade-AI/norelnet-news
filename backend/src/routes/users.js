import { Router } from "express";
import { User } from "../models/user.js";
import { requireAdmin, requireAuth } from "../middlewares/guard.js";

// Rutas administrativas para buscar usuarios y cambiar roles.

const r = Router();

// Buscar usuarios (nombre/email), con paginación
r.get("/", requireAuth, requireAdmin, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
  const skip = (page - 1) * limit;

  const flt = q ? {
    $or: [
      { email: { $regex: q, $options: "i" } },
      { name:  { $regex: q, $options: "i" } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    User.find(flt).sort({ createdAt: -1 }).skip(skip).limit(limit).select("email name role").lean(),
    User.countDocuments(flt),
  ]);

  res.json({ items, total, page, limit });
});

// Cambiar rol (viewer/editor/admin)
r.patch("/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const role = String(req.body.role || "");
  if (!["viewer", "editor", "admin"].includes(role)) {
    return res.status(400).json({ error: "Rol inválido" });
  }
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    .select("email name role").lean();
  if (!u) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true, user: u });
});

export default r;
