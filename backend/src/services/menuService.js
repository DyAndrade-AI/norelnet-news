import { category } from "../models/category.js";
import { Product } from "../models/product.js";

/**
 * Devuelve: [{ category: {name, slug}, items: [{id, product_name, price, description}, ...] }, ...]
 */
export const MenuService = {
  async getMenu() {
    //  Traer categorías activas en orden
    const categories = await category.find({ active: true })
      .sort({ order: 1, name: 1 })
      .lean();

    const catIds = categories.map(c => String(c._id));

    if (catIds.length === 0) return [];

    // Traer productos de esas categorías
    const products = await Product.find({ categoryId: { $in: catIds } })
      .sort({ createdAt: -1 }) // opcional: orden interno de items
      .lean();

    // Agrupar productos por categoryId
    const byCat = new Map(catIds.map(id => [id, []]));
    for (const p of products) {
      const key = String(p.categoryId);
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key).push({
        id: p._id,
        product_name: p.product_name,
        price: p.price,
        description: p.description
      });
    }

    // Armar respuesta siguiendo el orden de categories
    const result = categories.map(c => ({
      category: { name: c.name, slug: c.slug },
      items: byCat.get(String(c._id)) || []
    }));

    return result;
  }
};
