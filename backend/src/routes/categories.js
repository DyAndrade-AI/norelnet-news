import { Router } from "express";
import { list, getById, create, update, remove } from "../controllers/categoryController.js";

const router = Router();

// CRUD básico expuesto para panel interno (sin guardas aquí para facilitar pruebas)
router.get("/", list);
router.get("/:id", getById);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
