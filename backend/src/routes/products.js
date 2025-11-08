import { Router } from "express";
import { list, getById, create, update, remove } from "../controllers/productController.js";
import { requireEditor } from "../middlewares/guard.js";

const router = Router();

// Rutas del catálogo que comparte el front de menú y el panel

// públicos
router.get("/", list);
router.get("/:id", getById);

// solo editor/admin
router.post("/", requireEditor, create);
// Soporta ambos métodos para compatibilidad con el front
router.put("/:id", requireEditor, update);
router.patch("/:id", requireEditor, update);
router.delete("/:id", requireEditor, remove);

export default router;
