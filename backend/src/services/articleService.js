import { Article } from "../models/article.js";

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
    
    return { 
      items, 
      total, 
      page, 
      pages: Math.ceil(total / limit) 
    };
  },

  /**
   * Obtener noticia por ID
   * @param {string} id - ID de la noticia
   * @returns {Promise<Object|null>} Noticia encontrada o null
   */
  async getById(id) {
    return Article.findById(id).lean();
  },

  /**
   * Crear nueva noticia
   * @param {Object} payload - Datos de la noticia
   * @returns {Promise<Object>} Noticia creada
   */
  async create(payload) {
    const doc = await Article.create(payload);
    return doc.toObject();
  },

  /**
   * Actualizar noticia existente
   * @param {string} id - ID de la noticia
   * @param {Object} payload - Datos a actualizar
   * @returns {Promise<Object|null>} Noticia actualizada o null
   */
  async update(id, payload) {
    return Article.findByIdAndUpdate(id, payload, { new: true }).lean();
  },

  /**
   * Eliminar noticia
   * @param {string} id - ID de la noticia
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  async remove(id) {
    const deleted = await Article.findByIdAndDelete(id).lean();
    return !!deleted;
  },

  /**
   * Obtener noticias más recientes (para portada)
   * @param {number} limit - Número máximo de noticias
   * @returns {Promise<Array>} Lista de noticias recientes
   */
  async getRecent(limit = 10) {
    return Article.find()
      .sort({ fecha_publicacion: -1 })
      .limit(limit)
      .lean();
  },

  /**
   * Buscar noticias por texto en título, contenido o etiquetas
   * @param {string} texto - Texto a buscar
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Resultados paginados
   */
  async search(texto, { page = 1, limit = 20 } = {}) {
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
    
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  /**
   * Obtener noticias de un autor específico
   * @param {string} autorId - ID del autor
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Noticias del autor
   */
  async getByAutor(autorId, { page = 1, limit = 20 } = {}) {
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
    
    return { items, total, page, pages: Math.ceil(total / limit) };
  }
};
