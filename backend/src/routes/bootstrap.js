import { Router } from "express";
import { User } from "../models/user.js";
import { requireAuth } from "../middlewares/guard.js";

// Endpoint: POST /api/auth/bootstrap-admin
// Requisitos:
//   - User autenticado (sesión activa)
//   - Header x-bootstrap-token que coincida con ADMIN_BOOTSTRAP_TOKEN
//   - No debe existir ningún admin todavía
const r = Router();

r.post("/bootstrap-admin", requireAuth, async (req, res) => {
  try {
    const provided = req.get("x-bootstrap-token") || req.body?.token;
    const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;

    if (!expected) {
      return res.status(500).json({ error: "ADMIN_BOOTSTRAP_TOKEN no configurado" });
    }
    if (!provided || provided !== expected) {
      return res.status(403).json({ error: "Token inválido" });
    }

    const already = await User.exists({ role: "admin" });
    if (already) return res.status(409).json({ error: "Ya existe un admin, bootstrap deshabilitado" });

    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const updated = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true, projection: { email: 1, role: 1, name: 1 } }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

    // Actualiza la sesión para reflejar el nuevo rol
    req.session.user.role = "admin";

    res.json({ ok: true, user: updated });
  } catch (e) {
    res.status(500).json({ error: "Error interno" });
  }
});

export default r;
