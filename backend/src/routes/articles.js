import { Router } from "express";
import * as ArticleController from "../controllers/articleController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Rutas para gestión de artículos/noticias
 * Estas rutas utilizan el sistema de caché con Redis implementado
 */

const router = Router();

// Rutas públicas (lectura)
router.get("/", asyncHandler(ArticleController.list));
router.get("/recent", asyncHandler(ArticleController.getRecent));
router.get("/search", asyncHandler(ArticleController.search));
router.get("/:id", asyncHandler(ArticleController.getById));

// Rutas protegidas (escritura) - requieren autenticación
// TODO: Agregar middleware de autenticación cuando esté implementado
router.post("/", asyncHandler(ArticleController.create));
router.put("/:id", asyncHandler(ArticleController.update));
router.delete("/:id", asyncHandler(ArticleController.remove));

export default router;
