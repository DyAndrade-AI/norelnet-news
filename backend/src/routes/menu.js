import { Router } from "express";
import { getMenu } from "../controllers/menuController.js";

const router = Router();

// Endpoint público para que el front consuma el menú ya agrupado por categoría
router.get("/", getMenu);

export default router;
