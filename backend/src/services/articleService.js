import { Article } from "../models/article.js";
import { Cache } from "../utils/cache.js";

export const ArticleService = {
  /**
   * Listar noticias con filtros y paginación
   * @param {Object} options - Opciones de filtrado
   * @param {number} options.page - Número de página
   * @param {number} options.limit - Elementos por página
   * @param {string} options.categoria - Filtrar por categoría
   * @param {string} options.etiqueta - Filtrar por etiqueta
   * @returns {Promise<Object>} Lista paginada de noticias
   */
  async list({ page = 1, limit = 20, categoria, etiqueta } = {}) {
    // Generar clave única para esta consulta
    const cacheKey = `articles:list:p${page}:l${limit}:c${categoria || 'all'}:e${etiqueta || 'all'}`;
    
    // Intentar obtener del caché
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Si no está en caché, consultar la base de datos
    const skip = (page - 1) * limit;
    const filter = {};
    
    if (categoria) filter.categoria = categoria;
    if (etiqueta) filter.etiquetas = etiqueta;
    
    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ fecha_publicacion: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);
    
    const result = { 
      items, 
      total, 
      page, 
      pages: Math.ceil(total / limit) 
    };
    
    // Guardar en caché
    await Cache.set(cacheKey, result);
    
    return result;
  },

  /**
   * Obtener noticia por ID
   * @param {string} id - ID de la noticia
   * @returns {Promise<Object|null>} Noticia encontrada o null
   */
  async getById(id) {
    const cacheKey = `articles:id:${id}`;
    
    // Intentar obtener del caché
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Si no está en caché, consultar la base de datos
    const article = await Article.findById(id).lean();
    
    if (article) {
      // Guardar en caché solo si existe
      await Cache.set(cacheKey, article);
    }
    
    return article;
  },

  /**
   * Crear nueva noticia
   * @param {Object} payload - Datos de la noticia
   * @returns {Promise<Object>} Noticia creada
   */
  async create(payload) {
    const doc = await Article.create(payload);
    
    // Limpiar caché de artículos al crear uno nuevo
    await Cache.clearArticles();
    
    return doc.toObject();
  },

  /**
   * Actualizar noticia existente
   * @param {string} id - ID de la noticia
   * @param {Object} payload - Datos a actualizar
   * @returns {Promise<Object|null>} Noticia actualizada o null
   */
  async update(id, payload) {
    const updated = await Article.findByIdAndUpdate(id, payload, { new: true }).lean();
    
    if (updated) {
      // Limpiar caché de artículos al actualizar
      await Cache.clearArticles();
    }
    
    return updated;
  },

  /**
   * Eliminar noticia
   * @param {string} id - ID de la noticia
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  async remove(id) {
    const deleted = await Article.findByIdAndDelete(id).lean();
    
    if (deleted) {
      // Limpiar caché de artículos al eliminar
      await Cache.clearArticles();
    }
    
    return !!deleted;
  },

  /**
   * Obtener noticias más recientes (para portada)
   * @param {number} limit - Número máximo de noticias
   * @returns {Promise<Array>} Lista de noticias recientes
   */
  async getRecent(limit = 10) {
    const cacheKey = `articles:recent:${limit}`;
    
    // Intentar obtener del caché
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Si no está en caché, consultar la base de datos
    const articles = await Article.find()
      .sort({ fecha_publicacion: -1 })
      .limit(limit)
      .lean();
    
    // Guardar en caché
    await Cache.set(cacheKey, articles);
    
    return articles;
  },

  /**
   * Buscar noticias por texto en título, contenido o etiquetas
   * @param {string} texto - Texto a buscar
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Resultados paginados
   */
  async search(texto, { page = 1, limit = 20 } = {}) {
    const cacheKey = `articles:search:${texto}:p${page}:l${limit}`;
    
    // Intentar obtener del caché
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Si no está en caché, consultar la base de datos
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { titulo: { $regex: texto, $options: "i" } },
        { contenido: { $regex: texto, $options: "i" } },
        { etiquetas: { $regex: texto, $options: "i" } }
      ]
    };
    
    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ fecha_publicacion: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);
    
    const result = { items, total, page, pages: Math.ceil(total / limit) };
    
    // Guardar en caché
    await Cache.set(cacheKey, result);
    
    return result;
  },

  /**
   * Obtener noticias de un autor específico
   * @param {string} autorId - ID del autor
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Noticias del autor
   */
  async getByAutor(autorId, { page = 1, limit = 20 } = {}) {
    const cacheKey = `articles:autor:${autorId}:p${page}:l${limit}`;
    
    // Intentar obtener del caché
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Si no está en caché, consultar la base de datos
    const skip = (page - 1) * limit;
    const filter = { "autor.id": autorId };
    
    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ fecha_publicacion: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);
    
    const result = { items, total, page, pages: Math.ceil(total / limit) };
    
    // Guardar en caché
    await Cache.set(cacheKey, result);
    
    return result;
  }
};
