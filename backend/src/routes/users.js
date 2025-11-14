import { Router } from "express";
import {list, getById, create, update, remove, login, getProfile, changePassword, getByRol, logout} from "../controllers/userController.js";

const router = Router();

//CRUD para gestion de usuarios

router.get("/", list); //Probablemente restringido a Admin
router.get("/:id", getById);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

//Rutas adicionales
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", getProfile);
router.post("/change-password", changePassword);
router.get("/role/:rol", getByRol); //Probablemente restringido a Admin

export default router;