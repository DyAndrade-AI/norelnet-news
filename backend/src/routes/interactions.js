import { Router } from "express";
import * as InteractionController from "../controllers/interactionController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Rutas para gestión de interacciones de usuarios con noticias
 * Registra vistas, likes, shares y proporciona analytics
 */

const router = Router();

// Rutas públicas - registrar interacciones
router.post("/view/:articleId", asyncHandler(InteractionController.recordView));
router.post("/share/:articleId", asyncHandler(InteractionController.recordShare));

// Rutas que requieren autenticación
router.post("/like/:articleId", asyncHandler(InteractionController.recordLike));
router.get("/my-history", asyncHandler(InteractionController.getMyHistory));

// Rutas públicas - analytics
router.get("/trending", asyncHandler(InteractionController.getTrending));
router.get("/stats/:articleId", asyncHandler(InteractionController.getArticleStats));

export default router;
