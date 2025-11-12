import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  contenido: {
    type: String,
    required: true
  },
  autor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    nombre: {
      type: String,
      required: true
    }
  },
  categoria: {
    type: String,
    required: true,
    enum: ["Ciencia", "Tecnología", "Deportes", "Cultura", "Política", "Economía"]
  },
  etiquetas: {
    type: [String],
    default: []
  },
  fecha_publicacion: {
    type: Date,
    default: Date.now
  },
  imagen_url: {
    type: String,
    default: null
  }
}, { 
  timestamps: true // Agrega automáticamente createdAt y updatedAt
});

// Índices para optimizar búsquedas
articleSchema.index({ categoria: 1, fecha_publicacion: -1 });
articleSchema.index({ "autor.id": 1 });
articleSchema.index({ etiquetas: 1 });

export const Article = mongoose.model("Article", articleSchema);