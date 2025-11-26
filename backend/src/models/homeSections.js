import mongoose from "mongoose";

const homeSectionsSchema = new mongoose.Schema({
  // Sección: Portada (top stories)
  portada: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Article",
    default: []
  },
  
  // Sección: Análisis y contexto
  analisis: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Article",
    default: []
  },
  
  // Sección: Reportajes visuales (videos)
  visuales: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Article",
    default: []
  },
  
  // Sección: Newsletter (destacado)
  newsletter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    default: null
  },
  
  // Última actualización
  ultima_actualizacion: {
    type: Date,
    default: Date.now
  },
  
  // Usuario que realizó la última actualización
  actualizado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, {
  timestamps: true
});

export const HomeSections = mongoose.model("HomeSections", homeSectionsSchema);
