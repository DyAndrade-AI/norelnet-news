import { redisClient } from "../middlewares/session.js";

/**
 * Módulo de caché usando Redis para optimizar consultas de noticias
 */

const DEFAULT_TTL = 300; // 5 minutos en segundos

export const Cache = {
  /**
   * Obtener valor del caché
   * @param {string} key - Clave del caché
   * @returns {Promise<any|null>} Valor parseado o null si no existe
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error(`Error al obtener caché [${key}]:`, err);
      return null;
    }
  },

  /**
   * Guardar valor en el caché
   * @param {string} key - Clave del caché
   * @param {any} value - Valor a guardar (se serializa a JSON)
   * @param {number} ttl - Tiempo de vida en segundos (por defecto 5 minutos)
   * @returns {Promise<boolean>} true si se guardó correctamente
   */
  async set(key, value, ttl = DEFAULT_TTL) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error al guardar caché [${key}]:`, err);
      return false;
    }
  },

  /**
   * Eliminar una clave específica del caché
   * @param {string} key - Clave a eliminar
   * @returns {Promise<boolean>} true si se eliminó
   */
  async delete(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      console.error(`Error al eliminar caché [${key}]:`, err);
      return false;
    }
  },

  /**
   * Eliminar todas las claves que coincidan con un patrón
   * @param {string} pattern - Patrón de búsqueda (ej: "articles:*")
   * @returns {Promise<number>} Número de claves eliminadas
   */
  async deletePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return 0;
      
      await redisClient.del(keys);
      return keys.length;
    } catch (err) {
      console.error(`Error al eliminar caché con patrón [${pattern}]:`, err);
      return 0;
    }
  },

  /**
   * Limpiar todo el caché de artículos
   * @returns {Promise<number>} Número de claves eliminadas
   */
  async clearArticles() {
    return this.deletePattern("articles:*");
  }
};
