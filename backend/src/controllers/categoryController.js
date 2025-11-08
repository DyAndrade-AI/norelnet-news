import { categoryService } from "../services/categoryService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Se delega toda la lógica de datos al servicio para mantener el controlador ligero.

export const list = asyncHandler(async (_req, res) => {
  const items = await categoryService.list();
  res.json({ items });
});

export const getById = asyncHandler(async (req, res) => {
  const c = await categoryService.getById(req.params.id);
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
});

export const create = asyncHandler(async(req, res) => {
  const {name} = req.body || {};
  // Validación mínima para evitar documentos vacíos
  if (!name) return res.status(400).json({ error: "name required" });
  const created = await categoryService.create(req.body);
  res.status(201).json(created);
});

export const update = asyncHandler(async(req, res)=> {
  const updated = await categoryService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

export const remove = asyncHandler(async(req, res) => {
  const ok = await categoryService.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});
