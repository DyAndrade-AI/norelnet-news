import { Router } from "express";
import {
  list,
  getById,
  create,
  update,
  remove,
  getRecent,
  getByAutor,
  search
} from "../controllers/articleController.js";
import { requireAuth, requireEditor } from "../middlewares/auth.js";

const router = Router();

// Rutas públicas
router.get("/", list);
router.get("/recent", getRecent);
router.get("/search", search);
router.get("/author/:autorId", getByAutor);
router.get("/:id", getById);

// Rutas protegidas
router.post("/", requireAuth, create);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireEditor, remove);

export default router;
