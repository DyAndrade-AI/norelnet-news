import { HomeSections } from "../models/homeSections.js";
import { Article } from "../models/article.js";

export const HomeSectionsService = {
  /**
   * Obtener configuración actual del home
   * @returns {Promise<Object>} Configuración del home con artículos poblados
   */
  async getConfig() {
    let config = await HomeSections.findOne()
      .populate("portada", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("analisis", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("visuales", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("newsletter", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("actualizado_por", "nombre email rol");

    // Si no existe, crear una configuración vacía
    if (!config) {
      config = await HomeSections.create({});
    }

    return config;
  },

  /**
   * Actualizar sección específica del home
   * @param {string} seccion - Nombre de la sección (portada, analisis, visuales, newsletter)
   * @param {Array|string} articleIds - IDs de artículos a asignar
   * @param {string} updatedById - ID del usuario que actualiza
   * @returns {Promise<Object>} Configuración actualizada
   */
  async updateSection(seccion, articleIds, updatedById) {
    // Validar que la sección exista
    const secciones_validas = ["portada", "analisis", "visuales", "newsletter"];
    if (!secciones_validas.includes(seccion)) {
      throw new Error(`Sección inválida: ${seccion}`);
    }

    // Validar que los artículos existan
    const ids = Array.isArray(articleIds) ? articleIds : [articleIds];
    const articles = await Article.find({ _id: { $in: ids } });
    
    if (articles.length !== ids.length) {
      throw new Error("Uno o más artículos no existen");
    }

    // Actualizar o crear configuración
    let config = await HomeSections.findOne();
    if (!config) {
      config = new HomeSections();
    }

    config[seccion] = articleIds;
    config.ultima_actualizacion = new Date();
    config.actualizado_por = updatedById;

    await config.save();

    // Poblar y retornar
    return await config
      .populate("portada", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("analisis", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("visuales", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("newsletter", "titulo contenido autor categoria etiquetas fecha_publicacion imagen_url")
      .populate("actualizado_por", "nombre email rol");
  },

  /**
   * Obtener artículos disponibles para editar
   * @param {string} q - Búsqueda opcional
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de artículos
   */
  async searchArticles(q = "", limit = 20) {
    const filter = q.trim()
      ? { $or: [
          { titulo: { $regex: q, $options: "i" } },
          { contenido: { $regex: q, $options: "i" } },
          { "autor.nombre": { $regex: q, $options: "i" } },
          { categoria: { $regex: q, $options: "i" } }
        ]}
      : {};

    return await Article.find(filter)
      .select("titulo autor categoria fecha_publicacion")
      .sort({ fecha_publicacion: -1 })
      .limit(limit)
      .lean();
  }
};
