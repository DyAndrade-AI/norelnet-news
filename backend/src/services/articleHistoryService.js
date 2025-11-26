import cassandra from "cassandra-driver";
import { cassandraClient } from "../database-cassandra.js";

/**
 * Servicio de historial de noticias en Cassandra.
 * Registra eventos (crear, actualizar, eliminar) con un snapshot ligero
 * para auditoría y análisis temporal.
 */
const { TimeUuid } = cassandra.types;

export const ArticleHistoryService = {
  /**
   * Guarda un evento en el historial de una noticia.
   * No lanza error: si Cassandra falla, devuelve false y deja seguir el flujo.
   * @param {Object} params
   * @param {string} params.articleId - ID de la noticia
   * @param {string} params.action - Acción: created | updated | deleted
   * @param {string} params.userId - Usuario que realizó la acción
   * @param {Object} params.payload - Snapshot con contexto de la noticia
   * @returns {Promise<boolean>}
   */
  async recordEvent({ articleId, action, userId = "system", payload = {} }) {
    try {
      const query = `
        INSERT INTO article_history (article_id, event_time, event_id, action, user_id, payload)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await cassandraClient.execute(
        query,
        [
          articleId,
          new Date(),
          TimeUuid.now(),
          action,
          userId,
          JSON.stringify(payload)
        ],
        { prepare: true }
      );

      return true;
    } catch (err) {
      console.error("Error registrando historial de artículo:", err);
      return false;
    }
  },

  /**
   * Obtiene el historial de una noticia ordenado por fecha DESC.
   * @param {string} articleId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getHistory(articleId, limit = 50) {
    try {
      const query = `
        SELECT event_time, event_id, action, user_id, payload
        FROM article_history
        WHERE article_id = ?
        LIMIT ?
      `;

      const result = await cassandraClient.execute(
        query,
        [articleId, limit],
        { prepare: true }
      );

      return result.rows.map(row => ({
        eventTime: row.event_time,
        action: row.action,
        userId: row.user_id,
        eventId: row.event_id ? row.event_id.toString() : null,
        payload: row.payload ? JSON.parse(row.payload) : {}
      }));
    } catch (err) {
      console.error("Error obteniendo historial de artículo:", err);
      throw new Error("No se pudo obtener el historial de la noticia");
    }
  }
};
