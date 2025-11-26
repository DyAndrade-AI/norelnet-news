import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { 
  getHomeConfig, 
  updateSection, 
  searchArticles 
} from "../controllers/homeSectionsController.js";

const router = Router();

// Obtener configuración actual (público)
router.get("/config", getHomeConfig);

// Buscar artículos (solo admin)
router.get("/search", requireAdmin, searchArticles);

// Actualizar sección (solo admin)
router.put("/:seccion", requireAdmin, updateSection);

export default router;
