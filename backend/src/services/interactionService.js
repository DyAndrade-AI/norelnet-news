import { cassandraClient } from "../database-cassandra.js";
import cassandra from 'cassandra-driver';

/**
 * Servicio para gestionar interacciones de usuarios con noticias
 * Usa Cassandra para almacenar series temporales de interacciones
 */

export const InteractionService = {
  /**
   * Registrar una interacción de usuario con una noticia
   * @param {Object} interaction - Datos de la interacción
   * @param {string} interaction.userId - ID del usuario (o 'anonymous')
   * @param {string} interaction.articleId - ID del artículo
   * @param {string} interaction.type - Tipo: 'view', 'like', 'share', 'comment'
   * @param {Object} interaction.metadata - Datos adicionales (opcional)
   * @returns {Promise<Object>} Resultado de la operación
   */
  async recordInteraction({ userId, articleId, type, metadata = {} }) {
    try {
      const query = `
        INSERT INTO user_interactions 
        (user_id, article_id, interaction_type, timestamp, metadata)
        VALUES (?, ?, ?, toTimestamp(now()), ?)
      `;
      
      await cassandraClient.execute(
        query,
        [userId, articleId, type, JSON.stringify(metadata)],
        { prepare: true }
      );
      
      // Si es una vista, incrementar contador diario
      if (type === 'view') {
        await this.incrementDailyViews(articleId);
      }
      
      return { success: true, userId, articleId, type };
    } catch (err) {
      console.error('Error registrando interacción:', err);
      throw new Error('No se pudo registrar la interacción');
    }
  },

  /**
   * Incrementar contador de vistas diarias para un artículo
   * @param {string} articleId - ID del artículo
   */
  async incrementDailyViews(articleId) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const query = `
        UPDATE article_views_by_day
        SET view_count = view_count + 1
        WHERE date = ? AND article_id = ?
      `;
      
      await cassandraClient.execute(
        query,
        [today, articleId],
        { prepare: true }
      );
    } catch (err) {
      console.error('Error incrementando vistas diarias:', err);
      // No lanzar error, es operación secundaria
    }
  },

  /**
   * Obtener historial de interacciones de un usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Número máximo de resultados
   * @returns {Promise<Array>} Lista de interacciones
   */
  async getUserHistory(userId, limit = 50) {
    try {
      const query = `
        SELECT user_id, article_id, interaction_type, timestamp, metadata
        FROM user_interactions
        WHERE user_id = ?
        LIMIT ?
      `;
      
      const result = await cassandraClient.execute(
        query,
        [userId, limit],
        { prepare: true }
      );
      
      return result.rows.map(row => ({
        userId: row.user_id,
        articleId: row.article_id,
        type: row.interaction_type,
        timestamp: row.timestamp,
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      }));
    } catch (err) {
      console.error('Error obteniendo historial:', err);
      throw new Error('No se pudo obtener el historial');
    }
  },

  /**
   * Obtener artículos más vistos del día
   * @param {string} date - Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
   * @param {number} limit - Número de artículos a devolver
   * @returns {Promise<Array>} Lista de artículos con contador de vistas
   */
  async getMostViewedToday(date = null, limit = 10) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const query = `
        SELECT article_id, view_count
        FROM article_views_by_day
        WHERE date = ?
        LIMIT ?
      `;
      
      const result = await cassandraClient.execute(
        query,
        [targetDate, limit * 10], // Obtener más para ordenar
        { prepare: true }
      );
      
      // Ordenar por view_count (Cassandra no ordena por columnas no-clustering)
      const sorted = result.rows
        .map(row => ({
          articleId: row.article_id,
          viewCount: row.view_count ? parseInt(row.view_count.toString()) : 0
        }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, limit);
      
      return sorted;
    } catch (err) {
      console.error('Error obteniendo artículos más vistos:', err);
      throw new Error('No se pudo obtener los artículos más vistos');
    }
  },

  /**
   * Obtener estadísticas de interacciones de un artículo
   * @param {string} articleId - ID del artículo
   * @param {number} days - Número de días hacia atrás
   * @returns {Promise<Object>} Estadísticas del artículo
   */
  async getArticleStats(articleId, days = 7) {
    try {
      const stats = {
        articleId,
        totalViews: 0,
        viewsByDay: []
      };
      
      // Obtener vistas de los últimos N días
      const promises = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const query = `
          SELECT view_count
          FROM article_views_by_day
          WHERE date = ? AND article_id = ?
        `;
        
        promises.push(
          cassandraClient.execute(query, [dateStr, articleId], { prepare: true })
            .then(result => ({
              date: dateStr,
              views: result.rows[0] ? parseInt(result.rows[0].view_count.toString()) : 0
            }))
        );
      }
      
      const results = await Promise.all(promises);
      stats.viewsByDay = results;
      stats.totalViews = results.reduce((sum, day) => sum + day.views, 0);
      
      return stats;
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      throw new Error('No se pudo obtener las estadísticas');
    }
  }
};
