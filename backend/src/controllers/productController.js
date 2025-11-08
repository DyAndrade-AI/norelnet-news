import { ProductService } from "../services/productService.js";

// Controlador REST; solo valida input y traduce errores a respuestas HTTP.

export async function list(req, res, next){
  try{
    // Normalizamos la paginación para prevenir queries pesadas
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const data = await ProductService.list({page, limit});
    res.json(data);
} catch(err){
    next(err);
  }
}

export async function getById (req, res, next){
  try{
    const p = await ProductService.getById(req.params.id);
    if (!p) return res.status(404).json({ error: "not found"});
    res.json(p);
  } catch(err){
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { categoryId, product_name, price, description } = req.body || {};
    if (!categoryId || !product_name || price == null || !description) {
      return res.status(400).json({
        error: "categoryId, product_name, price, description required"
      });
    }
    const created = await ProductService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}


export async function update(req, res, next) {
  try{
    const updated = await ProductService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch(err){
    next(err);
  }
}

export async function remove(req, res, next) {
  try{ 
    const ok = await ProductService.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
 } catch(err){
  next(err);
 }
}
