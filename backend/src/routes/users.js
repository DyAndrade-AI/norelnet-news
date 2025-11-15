import { Router } from "express";
import {
  list,
  getById,
  create,
  update,
  remove,
  login,
  getProfile,
  changePassword,
  getByRol,
  logout
} from "../controllers/userController.js";
import {
  requireAdmin,
  requireAuth,
  requireSelfOrAdmin
} from "../middlewares/auth.js";

const router = Router();

// Registro y autenticación
router.post("/register", create);
router.post("/login", login);
router.post("/logout", requireAuth, logout);

// Perfil del usuario autenticado
router.get("/profile", requireAuth, getProfile);
router.post("/change-password", requireAuth, changePassword);

// Administración de usuarios
router.get("/", requireAdmin, list);
router.get("/role/:rol", requireAdmin, getByRol);
router.delete("/:id", requireAdmin, remove);

// Acciones sobre un usuario específico (propio o admin)
router.get("/:id", requireSelfOrAdmin(), getById);
router.put("/:id", requireSelfOrAdmin(), update);

export default router;
