import mongoose from "mongoose";

// Representa usuarios del panel; passwords se guardan como hash bcrypt.

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["viewer", "editor", "admin"], default: "viewer" },
  name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
