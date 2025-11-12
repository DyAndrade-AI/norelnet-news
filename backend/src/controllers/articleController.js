import { ArticleService } from "../services/articleService.js";

/**
 * Listar noticias con filtros y paginación
 * GET /api/articles?page=1&limit=20&categoria=Ciencia&etiqueta=mexico
 */
export async function list(req, res, next) {
  try {
    const { page, limit, categoria, etiqueta } = req.query;
    
    const data = await ArticleService.list({
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Number(limit) || 20),
      categoria,
      etiqueta
    });
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener noticia por ID
 * GET /api/articles/:id
 */
export async function getById(req, res, next) {
  try {
    const article = await ArticleService.getById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    
    res.json(article);
  } catch (err) {
    next(err);
  }
}

/**
 * Crear nueva noticia
 * POST /api/articles
 * Body: { titulo, contenido, categoria, etiquetas, imagen_url }
 * Requiere: Usuario autenticado (req.user debe existir)
 */
export async function create(req, res, next) {
  try {
    const { titulo, contenido, categoria, etiquetas, imagen_url } = req.body;
    
    // Validación básica
    if (!titulo || !contenido || !categoria) {
      return res.status(400).json({ 
        error: "titulo, contenido y categoria son requeridos" 
      });
    }
    
    // Validar que la categoría sea válida
    const categoriasValidas = ["Ciencia", "Tecnología", "Deportes", "Cultura", "Política", "Economía"];
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({ 
        error: `categoria debe ser una de: ${categoriasValidas.join(", ")}` 
      });
    }
    
    // El autor viene de la sesión (req.user debe ser seteado por middleware de autenticación)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    const payload = {
      titulo,
      contenido,
      autor: {
        id: req.user._id,
        nombre: req.user.nombre
      },
      categoria,
      etiquetas: etiquetas || [],
      imagen_url: imagen_url || null
    };
    
    const created = await ArticleService.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar noticia existente
 * PUT /api/articles/:id
 * Body: { titulo?, contenido?, categoria?, etiquetas?, imagen_url? }
 * Requiere: Usuario autenticado
 */
export async function update(req, res, next) {
  try {
    // Validar categoría si viene en el body
    if (req.body.categoria) {
      const categoriasValidas = ["Ciencia", "Tecnología", "Deportes", "Cultura", "Política", "Economía"];
      if (!categoriasValidas.includes(req.body.categoria)) {
        return res.status(400).json({ 
          error: `categoria debe ser una de: ${categoriasValidas.join(", ")}` 
        });
      }
    }
    
    const updated = await ArticleService.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Eliminar noticia
 * DELETE /api/articles/:id
 * Requiere: Usuario autenticado (editor o admin)
 */
export async function remove(req, res, next) {
  try {
    const ok = await ArticleService.remove(req.params.id);
    
    if (!ok) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener noticias recientes (portada)
 * GET /api/articles/recent?limit=10
 */
export async function getRecent(req, res, next) {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const articles = await ArticleService.getRecent(limit);
    res.json(articles);
  } catch (err) {
    next(err);
  }
}

/**
 * Buscar noticias por texto
 * GET /api/articles/search?q=orquidea&page=1&limit=20
 */
export async function search(req, res, next) {
  try {
    const { q, page, limit } = req.query;
    
    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Parámetro 'q' es requerido" });
    }
    
    const data = await ArticleService.search(q, {
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Number(limit) || 20)
    });
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener noticias de un autor específico
 * GET /api/articles/author/:autorId?page=1&limit=20
 */
export async function getByAutor(req, res, next) {
  try {
    const { page, limit } = req.query;
    
    const data = await ArticleService.getByAutor(req.params.autorId, {
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Number(limit) || 20)
    });
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}
