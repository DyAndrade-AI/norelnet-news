// Conexión centralizada a Mongo usando mongoose, pensada para reutilizar en tests y CLI
import mongoose from "mongoose";
export async function connectDB(uri) {
    if(!uri) throw new Error("MONGO_URI not set");
    await mongoose.connect(uri);
    console.log("MongoDB conectado");
}
