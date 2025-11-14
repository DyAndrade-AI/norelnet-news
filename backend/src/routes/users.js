import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/guard.js";
import { list, getById, create, update, remove, login, getProfile, changePassword, getByRol, logout } from "../controllers/userController.js";

const router = Router();

// Registro público
router.post("/", create);

// Autenticación
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/profile", requireAuth, getProfile);
router.post("/change-password", requireAuth, changePassword);

// Administración
router.get("/", requireAdmin, list);
router.get("/role/:rol", requireAdmin, getByRol);
router.delete("/:id", requireAdmin, remove);

// Operaciones sobre el propio usuario
router.get("/:id", requireAuth, getById);
router.patch("/:id", requireAuth, update);

export default router;
