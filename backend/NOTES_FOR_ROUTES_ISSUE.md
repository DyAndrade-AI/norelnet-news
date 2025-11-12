# 📋 Notas para: "Actualizar rutas, middlewares e index.js"

> **Para:** Compañero encargado del issue de Rutas y Middlewares  
> **De:** Encargado de Modelos, Servicios y Controladores  
> **Proyecto:** NorelNet News - Plataforma de Noticias  
> **Fecha:** Noviembre 2025

---

## 🎯 ¿Qué se completó en el issue anterior?

Se actualizaron **completamente** los modelos, servicios y controladores del sistema:

✅ **2 Modelos (MongoDB):**
- `backend/src/models/article.js` - Estructura de noticias
- `backend/src/models/user.js` - Estructura de usuarios

✅ **2 Servicios (Lógica de negocio):**
- `backend/src/services/articleService.js` - 8 métodos para noticias
- `backend/src/services/userService.js` - 9 métodos para usuarios

✅ **2 Controladores (Endpoints HTTP):**
- `backend/src/controllers/articleController.js` - 8 endpoints
- `backend/src/controllers/userController.js` - 10 endpoints

---

## 🚨 LO MÁS IMPORTANTE

### Los controladores están listos y esperando ser conectados

Todos los controladores exportan funciones que ya:
- ✅ Manejan las peticiones HTTP (req, res)
- ✅ Validan datos de entrada
- ✅ Llaman a los servicios correspondientes
- ✅ Devuelven respuestas JSON
- ✅ Pasan errores al middleware de error con `next(err)`

**Solo necesitas conectarlos a las rutas.**

---

## 📦 Archivos que NECESITAS crear/actualizar

### 1. **Rutas de Noticias** (`backend/src/routes/articles.js`)

Debes crear este archivo y conectar los controladores:

```javascript
import express from "express";
import * as articleController from "../controllers/articleController.js";
import { requireAuth } from "../middlewares/auth.js"; // Tu middleware de autenticación

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get("/", articleController.list);
router.get("/recent", articleController.getRecent);
router.get("/search", articleController.search);
router.get("/author/:autorId", articleController.getByAutor);
router.get("/:id", articleController.getById);

// Rutas protegidas (requieren autenticación)
router.post("/", requireAuth, articleController.create);
router.put("/:id", requireAuth, articleController.update);
router.delete("/:id", requireAuth, articleController.remove);

export default router;
```

---

### 2. **Rutas de Usuarios** (`backend/src/routes/users.js`)

```javascript
import express from "express";
import * as userController from "../controllers/userController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Rutas públicas
router.post("/register", userController.create); // Registro

// Rutas de autenticación
router.post("/login", userController.login);
router.post("/logout", requireAuth, userController.logout);
router.get("/profile", requireAuth, userController.getProfile);
router.post("/change-password", requireAuth, userController.changePassword);

// Rutas protegidas (solo admin)
router.get("/", requireAdmin, userController.list);
router.get("/role/:rol", requireAdmin, userController.getByRol);
router.delete("/:id", requireAdmin, userController.remove);

// Rutas protegidas (mismo usuario o admin)
router.get("/:id", requireAuth, userController.getById);
router.put("/:id", requireAuth, userController.update);

export default router;
```

---

### 3. **Actualizar `index.js`** (`backend/src/index.js`)

Debes importar y montar las nuevas rutas:

```javascript
import express from "express";
import mongoose from "mongoose";
// ... otros imports

// IMPORTAR LAS NUEVAS RUTAS
import articlesRouter from "./routes/articles.js";
import usersRouter from "./routes/users.js";

const app = express();

// Middlewares
app.use(express.json());
// ... otros middlewares

// MONTAR LAS RUTAS
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);

// Middleware de errores (debe ir al final)
app.use(errorHandler);

// Conectar a MongoDB y arrancar servidor
// ...
```

---

## 🔐 Middlewares que DEBES crear

### 1. **Middleware de Autenticación** (`backend/src/middlewares/auth.js`)

Este es el más importante. Los controladores asumen que `req.user` existe cuando el usuario está autenticado.

```javascript
import { redisClient } from "../database.js"; // Tu cliente Redis

/**
 * Middleware que verifica si el usuario está autenticado
 * Debe popular req.user con el usuario desde Redis/sesión
 */
export async function requireAuth(req, res, next) {
  try {
    // Opción 1: Usando Redis directamente
    const sessionId = req.headers["x-session-id"]; // O desde cookies
    if (!sessionId) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    const userData = await redisClient.get(`session:${sessionId}`);
    if (!userData) {
      return res.status(401).json({ error: "Sesión expirada" });
    }
    
    req.user = JSON.parse(userData);
    next();
    
    // Opción 2: Si usas express-session con Redis
    // if (!req.session || !req.session.user) {
    //   return res.status(401).json({ error: "No autenticado" });
    // }
    // req.user = req.session.user;
    // next();
    
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware que verifica si el usuario es admin
 */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: se requiere rol admin" });
    }
    next();
  });
}

/**
 * Middleware que verifica si el usuario es editor o admin
 */
export function requireEditor(req, res, next) {
  requireAuth(req, res, () => {
    if (!["editor", "admin"].includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado: se requiere rol editor o admin" });
    }
    next();
  });
}
```

---

### 2. **Actualizar Middleware de Sesión** (`backend/src/middlewares/session.js`)

Ya existe este archivo, pero debes actualizarlo para trabajar con Redis:

```javascript
import session from "express-session";
import RedisStore from "connect-redis";
import { redisClient } from "../database.js";

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || "tu-secreto-aqui",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días
  }
});
```

---

### 3. **Middleware de Error** (ya existe: `backend/src/middlewares/error.js`)

Asegúrate de que maneje los errores de MongoDB:

```javascript
export function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  
  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      error: "Error de validación", 
      details: err.message 
    });
  }
  
  // Error de cast (ID inválido)
  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID inválido" });
  }
  
  // Error de duplicado (email único)
  if (err.code === 11000) {
    return res.status(409).json({ error: "Registro duplicado" });
  }
  
  // Error genérico
  res.status(500).json({ error: "Error interno del servidor" });
}
```

---

## 🔗 Integración con Redis (IMPORTANTE)

### En `userController.login`:

Actualmente el login solo verifica credenciales y devuelve el usuario. **TÚ debes implementar:**

```javascript
// En userController.js, función login:
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son requeridos" });
    }
    
    const user = await UserService.verifyPassword(email, password);
    
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    // 🔴 AQUÍ DEBES CREAR LA SESIÓN CON REDIS
    // Opción 1: Usando express-session (automático con el middleware)
    req.session.user = user;
    
    // Opción 2: Manualmente con Redis
    // const sessionId = generateSessionId(); // UUID o similar
    // await redisClient.set(
    //   `session:${sessionId}`,
    //   JSON.stringify(user),
    //   { EX: 60 * 60 * 24 * 7 } // 7 días
    // );
    // res.cookie("sessionId", sessionId, { httpOnly: true });
    
    res.json({ 
      message: "Login exitoso",
      user 
    });
  } catch (err) {
    next(err);
  }
}
```

### En `userController.logout`:

```javascript
export async function logout(req, res, next) {
  try {
    // 🔴 AQUÍ DEBES DESTRUIR LA SESIÓN
    // Opción 1: Con express-session
    req.session.destroy((err) => {
      if (err) return next(err);
      res.json({ message: "Logout exitoso" });
    });
    
    // Opción 2: Manualmente con Redis
    // const sessionId = req.cookies.sessionId;
    // await redisClient.del(`session:${sessionId}`);
    // res.clearCookie("sessionId");
    // res.json({ message: "Logout exitoso" });
    
  } catch (err) {
    next(err);
  }
}
```

---

## 📊 Estructura de Rutas Completa (Referencia)

```
BASE: http://localhost:3000

NOTICIAS:
├── GET    /api/articles                    → Listar noticias
├── GET    /api/articles/recent             → Noticias recientes
├── GET    /api/articles/search?q=texto     → Buscar noticias
├── GET    /api/articles/author/:autorId    → Noticias de un autor
├── GET    /api/articles/:id                → Detalle de noticia
├── POST   /api/articles                    → Crear noticia (auth)
├── PUT    /api/articles/:id                → Actualizar noticia (auth)
└── DELETE /api/articles/:id                → Eliminar noticia (auth)

USUARIOS:
├── POST   /api/users/register              → Registrar usuario
├── POST   /api/users/login                 → Login
├── POST   /api/users/logout                → Logout (auth)
├── GET    /api/users/profile               → Perfil actual (auth)
├── POST   /api/users/change-password       → Cambiar contraseña (auth)
├── GET    /api/users                       → Listar usuarios (admin)
├── GET    /api/users/role/:rol             → Usuarios por rol (admin)
├── GET    /api/users/:id                   → Detalle de usuario (auth)
├── PUT    /api/users/:id                   → Actualizar usuario (auth)
└── DELETE /api/users/:id                   → Eliminar usuario (admin)
```

---

## 🚨 Cosas Críticas que Debes Saber

### 1. **req.user DEBE existir en rutas autenticadas**

Los controladores asumen que `req.user` tiene esta estructura:

```javascript
req.user = {
  _id: "userId123",
  nombre: "María López",
  email: "maria@example.com",
  rol: "editor"
}
```

Si no existe `req.user` en una ruta protegida, el controlador devolverá error 401.

---

### 2. **El middleware `requireAuth` debe ir ANTES del controlador**

```javascript
// ✅ CORRECTO
router.post("/", requireAuth, articleController.create);

// ❌ INCORRECTO
router.post("/", articleController.create, requireAuth);
```

---

### 3. **Orden de rutas específicas antes de dinámicas**

```javascript
// ✅ CORRECTO
router.get("/recent", articleController.getRecent);
router.get("/:id", articleController.getById);

// ❌ INCORRECTO (/:id capturará "recent")
router.get("/:id", articleController.getById);
router.get("/recent", articleController.getRecent);
```

---

### 4. **Middleware de errores al FINAL**

```javascript
// En index.js

// 1. Middlewares generales
app.use(express.json());
app.use(sessionMiddleware);

// 2. Rutas
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);

// 3. Middleware de errores (SIEMPRE AL FINAL)
app.use(errorHandler);
```

---

## 📝 Archivos que ya NO existen (fueron eliminados)

Estos archivos del sistema de restaurante fueron eliminados:

```
❌ backend/src/routes/categories.js
❌ backend/src/routes/menu.js
❌ backend/src/routes/products.js
❌ backend/src/controllers/categoryController.js
❌ backend/src/controllers/menuController.js
❌ backend/src/controllers/productController.js
❌ backend/src/services/categoryService.js
❌ backend/src/services/menuService.js
❌ backend/src/services/productService.js
```

**Debes eliminar las importaciones de estos archivos en:**
- `backend/src/routes/bootstrap.js` (si existe)
- `backend/src/index.js`

---

## 🔄 Flujo de una Petición (para que entiendas)

```
1. Cliente hace request:
   POST /api/articles
   Body: { titulo: "...", contenido: "...", categoria: "Ciencia" }
   Header: x-session-id: "session123"

2. Express recibe la petición
   ↓
3. Pasa por middleware de sesión (session.js)
   ↓
4. Llega a la ruta: router.post("/", requireAuth, articleController.create)
   ↓
5. Middleware requireAuth (auth.js):
   - Busca sesión en Redis
   - Popula req.user
   - Llama next()
   ↓
6. Controlador (articleController.create):
   - Valida datos
   - Toma req.user._id y req.user.nombre
   - Llama ArticleService.create()
   ↓
7. Servicio (ArticleService.create):
   - Crea documento en MongoDB
   - Retorna noticia creada
   ↓
8. Controlador devuelve:
   res.status(201).json(created)
   ↓
9. Cliente recibe respuesta JSON
```

---

## 🧪 Cómo Probar los Endpoints (con Postman/Thunder Client)

### 1. Registrar usuario:
```
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@test.com",
  "password": "password123",
  "rol": "editor"
}
```

### 2. Login:
```
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "juan@test.com",
  "password": "password123"
}
```
Guarda el sessionId que devuelva.

### 3. Crear noticia (autenticado):
```
POST http://localhost:3000/api/articles
Content-Type: application/json
x-session-id: <tu-session-id>

{
  "titulo": "Mi primera noticia",
  "contenido": "Contenido de la noticia...",
  "categoria": "Tecnología",
  "etiquetas": ["tech", "ia"]
}
```

### 4. Listar noticias:
```
GET http://localhost:3000/api/articles?page=1&limit=10
```

---

## ✅ Checklist para tu Issue

Asegúrate de completar:

- [ ] Crear `backend/src/routes/articles.js`
- [ ] Crear `backend/src/routes/users.js`
- [ ] Crear `backend/src/middlewares/auth.js` (requireAuth, requireAdmin)
- [ ] Actualizar `backend/src/middlewares/session.js` con Redis
- [ ] Actualizar `backend/src/middlewares/error.js` para manejar errores de MongoDB
- [ ] Actualizar `backend/src/index.js` para montar las nuevas rutas
- [ ] Eliminar imports de rutas antiguas (categories, menu, products)
- [ ] Implementar creación de sesión en Redis al hacer login
- [ ] Implementar destrucción de sesión en Redis al hacer logout
- [ ] Probar todos los endpoints con Postman/Thunder Client
- [ ] Verificar que `req.user` se popula correctamente

---

## 🎓 Recursos Útiles

- **express-session con Redis:** https://www.npmjs.com/package/connect-redis
- **Bcrypt (ya usado en services):** https://www.npmjs.com/package/bcrypt
- **Mongoose (ya usado en models):** https://mongoosejs.com/docs/guide.html

---

## 📞 Dudas Comunes

### ¿Dónde está la conexión a MongoDB?
Ya debe existir en `backend/src/database.js`. Solo úsala.

### ¿Dónde está la conexión a Redis?
Debe estar en `backend/src/database.js` o créala si no existe:

```javascript
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

await redisClient.connect();
```

### ¿Qué es `next(err)`?
Pasa el error al middleware de errores (error.js) que lo manejará centralizadamente.

### ¿Por qué algunos endpoints requieren auth y otros no?
- **Públicos:** Listar, ver detalles, buscar (cualquiera puede ver noticias)
- **Autenticados:** Crear, editar, eliminar (solo usuarios logueados)
- **Admin:** Eliminar usuarios, listar usuarios (solo administradores)

---

## 🎯 Tu Objetivo Final

Al completar tu issue, el sistema debe:

1. ✅ Responder a todas las rutas definidas en los controladores
2. ✅ Autenticar usuarios con Redis/sesiones
3. ✅ Proteger rutas con middlewares (requireAuth, requireAdmin)
4. ✅ Manejar errores centralizadamente
5. ✅ Conectar MongoDB correctamente

---

**¡Éxito con tu issue!** 🚀

Si tienes dudas, revisa:
1. `backend/DOCUMENTATION.md` - Documentación completa del sistema
2. Los comentarios en cada archivo de controlador
3. Esta guía

---

**Creado por:** Encargado de Modelos/Servicios/Controladores  
**Fecha:** Noviembre 2025  
**Proyecto:** NorelNet News - Universidad de Guanajuato
