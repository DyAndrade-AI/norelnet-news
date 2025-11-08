import mongoose from "mongoose";

// Utilidad local para mantener slugs consistentes sin depender de librerías externas
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-") 
    .replace(/(^-|-$)/g, "");
}

const categorySchema = new mongoose.Schema({
    name: {type:String, required: true},
    slug: {type: String},
    order: {type: Number, default: 0, required: true},
    active: {type: Boolean, default: true}
}, {timestamps : true});

categorySchema.pre("save", function (next) {
  // Generamos slug automáticamente si no viene definido
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  // Permite que PATCH / PUT actualice el slug sin lógica adicional en el servicio
  if (update.name && !update.slug) {
    update.slug = slugify(update.name);
  }
  next();
});
export const category = mongoose.model("category", categorySchema);
