import {Product} from "../models/product.js"

// Servicio CRUD para productos, se mantiene lean para devolver objetos planos
// y poder reutilizarlo tanto en controladores como en tests.

export const ProductService = {
    async list({ page=1, limit = 20} = {}){
        const skip = (page - 1)* limit;
        // Traemos resultados paginados y conteo total en paralelo
        const [items, total] = await Promise.all([
            Product.find().populate({path:"categoryId", select: "name slug order"}).sort({ createdAt: -1}).skip(skip).limit(limit).lean(),
            Product.countDocuments()
        ]);
        return {items, total, page, pages: Math.ceil(total/limit)};
    },
    getById(id){
        return Product.findById(id).lean();
    },

    async create (payload){
        const doc = await Product.create(payload);
        return doc.toObject();
    },

    async update(id, payload){
        const updated = await Product.findByIdAndUpdate(id, payload, {new:true}).lean();
        return updated;
    },

    async remove(id){
        const deleted = await Product.findByIdAndDelete(id).lean();
        return !!deleted; //true si se borro, false si no existia
    }
};
