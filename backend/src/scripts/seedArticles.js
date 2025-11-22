import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../database.js";
import { Article } from "../models/article.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.resolve(__dirname, "../../seed/articles.json");

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === "object") {
    if (Object.prototype.hasOwnProperty.call(value, "$oid")) {
      return value.$oid;
    }
    if (Object.prototype.hasOwnProperty.call(value, "$date")) {
      return new Date(value.$date);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, normalizeValue(val)]),
    );
  }

  return value;
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI no está definido");

  await connectDB(uri);

  const raw = await fs.readFile(seedPath, "utf-8");
  const data = JSON.parse(raw);
  const articles = data.map((item) => normalizeValue(item));

  if (!articles.length) {
    console.log("No hay artículos que insertar.");
    await mongoose.disconnect();
    return;
  }

  try {
    const inserted = await Article.insertMany(articles, { ordered: false });
    console.log(`Artículos insertados: ${inserted.length}`);
  } catch (err) {
    if (err?.writeErrors) {
      console.warn(
        `Se insertaron ${err.insertedDocs?.length || 0} artículos; ${err.writeErrors.length} fallaron (posibles duplicados).`,
      );
    } else {
      throw err;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Error al ejecutar seed:", err);
  process.exit(1);
});
