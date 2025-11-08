import mongoose from "mongoose";

// Modelo de producto utilizado en el menú/tienda.

const ProductSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Types.ObjectId, ref:"category", required:true, index: true},
    product_name : { type:String, required:true},
    price : { type:Number, required:true},
    // Nota: la propiedad "require" debería ser "required".
    description : { type:String, require:true}
}, {timestamps: true});

export const Product = mongoose.model("Product", ProductSchema);
