import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ["lector", "editor", "admin"],
    default: "lector"
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true // agrega automáticamente createdAt y updatedAt
});

// indice para optimizar login
userSchema.index({ email: 1 });

export const User = mongoose.model("User", userSchema);