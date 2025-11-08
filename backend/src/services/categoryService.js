import { category } from "../models/category.js";

// Servicio simple para CRUD de categorías, los controladores solo orquestan validaciones.

export const categoryService = {
    list: async () => category.find().sort({ order: 1, name: 1 }).lean(),
  getById: (id) => category.findById(id).lean(),
  create: (payload) => category.create(payload),
  update: (id, payload) => category.findByIdAndUpdate(id, payload, { new: true }).lean(),
  remove: async (id) => !!(await category.findByIdAndDelete(id))
};
