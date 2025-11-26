import { HomeSectionsService } from "../services/homeSectionsService.js";

/**
 * Obtener configuración del home
 * GET /api/home/config
 */
export async function getHomeConfig(req, res, next) {
  try {
    const config = await HomeSectionsService.getConfig();
    res.json(config);
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar sección específica
 * PUT /api/home/:seccion
 * Body: { articleIds: string[] }
 * Requiere: Admin
 */
export async function updateSection(req, res, next) {
  try {
    const { seccion } = req.params;
    const { articleIds } = req.body;
    
    if (!articleIds || !Array.isArray(articleIds)) {
      return res.status(400).json({ error: "articleIds debe ser un array" });
    }

    const config = await HomeSectionsService.updateSection(
      seccion,
      articleIds,
      req.user._id
    );

    res.json(config);
  } catch (err) {
    next(err);
  }
}

/**
 * Buscar artículos para añadir a secciones
 * GET /api/home/search
 * Query: { q?: string, limit?: number }
 * Requiere: Admin
 */
export async function searchArticles(req, res, next) {
  try {
    const { q = "", limit = 20 } = req.query;
    const articles = await HomeSectionsService.searchArticles(q, Math.min(parseInt(limit), 100));
    res.json(articles);
  } catch (err) {
    next(err);
  }
}
