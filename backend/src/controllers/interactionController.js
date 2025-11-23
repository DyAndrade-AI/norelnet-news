import { InteractionService } from "../services/interactionService.js";

/**
 * Controlador para endpoints de interacciones de usuarios con noticias
 */

/**
 * Registrar una vista de artículo
 * POST /api/interactions/view/:articleId
 */
export async function recordView(req, res, next) {
  try {
    const { articleId } = req.params;
    const userId = req.user?._id?.toString() || 'anonymous';
    
    const result = await InteractionService.recordInteraction({
      userId,
      articleId,
      type: 'view',
      metadata: {
        userAgent: req.get('user-agent'),
        ip: req.ip
      }
    });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Registrar un like de artículo
 * POST /api/interactions/like/:articleId
 */
export async function recordLike(req, res, next) {
  try {
    const { articleId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Debes estar autenticado para dar like' });
    }
    
    const userId = req.user._id.toString();
    
    const result = await InteractionService.recordInteraction({
      userId,
      articleId,
      type: 'like'
    });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Registrar un share de artículo
 * POST /api/interactions/share/:articleId
 */
export async function recordShare(req, res, next) {
  try {
    const { articleId } = req.params;
    const { platform } = req.body; // facebook, twitter, whatsapp, etc.
    const userId = req.user?._id?.toString() || 'anonymous';
    
    const result = await InteractionService.recordInteraction({
      userId,
      articleId,
      type: 'share',
      metadata: { platform }
    });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener historial de interacciones del usuario autenticado
 * GET /api/interactions/my-history?limit=50
 */
export async function getMyHistory(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Debes estar autenticado' });
    }
    
    const userId = req.user._id.toString();
    const limit = Math.min(100, Number(req.query.limit) || 50);
    
    const history = await InteractionService.getUserHistory(userId, limit);
    
    res.json({ userId, total: history.length, items: history });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener artículos más vistos del día
 * GET /api/interactions/trending?limit=10&date=2025-11-23
 */
export async function getTrending(req, res, next) {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const date = req.query.date || null; // YYYY-MM-DD opcional
    
    const trending = await InteractionService.getMostViewedToday(date, limit);
    
    res.json({ date: date || new Date().toISOString().split('T')[0], trending });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener estadísticas de un artículo específico
 * GET /api/interactions/stats/:articleId?days=7
 */
export async function getArticleStats(req, res, next) {
  try {
    const { articleId } = req.params;
    const days = Math.min(30, Number(req.query.days) || 7);
    
    const stats = await InteractionService.getArticleStats(articleId, days);
    
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
