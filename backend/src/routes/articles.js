import { Router } from "express";
import { requireAuth, requireEditor } from "../middlewares/guard.js";
import { list, getById, create, update, remove, getRecent, getByAutor, search } from "../controllers/articleController.js";

const router = Router();

// Rutas públicas
router.get("/", list);
router.get("/recent", getRecent);
router.get("/search", search);
router.get("/author/:autorId", getByAutor);
router.get("/:id", getById);

// Rutas protegidas
router.post("/", requireAuth, create);
router.patch("/:id", requireAuth, update);
router.delete("/:id", requireEditor, remove);

export default router;
