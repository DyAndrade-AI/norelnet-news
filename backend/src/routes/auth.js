import { Router } from "express";
import {
  create,
  login,
  logout,
  getProfile,
  changePassword,
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/auth.js";

// Rutas dedicadas a autenticación para el front (login, register, perfil, etc.)
const router = Router();

router.post("/register", create);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getProfile);
router.post("/change-password", requireAuth, changePassword);

export default router;
