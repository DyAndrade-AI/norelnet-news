import { UserService } from "../services/userService.js";

/**
 * Listar todos los usuarios (sin contraseñas)
 * GET /api/users
 * Requiere: Admin
 */
export async function list(req, res, next) {
  try {
    const users = await UserService.list();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener usuario por ID
 * GET /api/users/:id
 */
export async function getById(req, res, next) {
  try {
    const user = await UserService.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * Crear nuevo usuario (registro)
 * POST /api/users
 * Body: { nombre, email, password, rol? }
 */
export async function create(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;
    
    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: "nombre, email y password son requeridos" 
      });
    }
    
    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    
    // Validar rol si viene
    if (rol && !["lector", "editor", "admin"].includes(rol)) {
      return res.status(400).json({ error: "rol debe ser: lector, editor o admin" });
    }
    
    const created = await UserService.create({ nombre, email, password, rol });
    res.status(201).json(created);
  } catch (err) {
    // Error de email duplicado (MongoDB unique constraint)
    if (err.code === 11000 || err.message.includes("ya está registrado")) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    next(err);
  }
}

/**
 * Actualizar usuario
 * PUT /api/users/:id
 * Body: { nombre?, email?, password?, rol? }
 * Requiere: Usuario autenticado (mismo usuario o admin)
 */
export async function update(req, res, next) {
  try {
    // Validar email si viene
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: "Email inválido" });
      }
    }
    
    // Validar contraseña si viene
    if (req.body.password && req.body.password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    
    // Validar rol si viene
    if (req.body.rol && !["lector", "editor", "admin"].includes(req.body.rol)) {
      return res.status(400).json({ error: "rol debe ser: lector, editor o admin" });
    }
    
    const updated = await UserService.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(updated);
  } catch (err) {
    // Error de email duplicado
    if (err.code === 11000) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    next(err);
  }
}

/**
 * Eliminar usuario
 * DELETE /api/users/:id
 * Requiere: Admin
 */
export async function remove(req, res, next) {
  try {
    const ok = await UserService.remove(req.params.id);
    
    if (!ok) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

/**
 * Login de usuario
 * POST /api/auth/login
 * Body: { email, password }
 */
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
    
    // NOTA: Aquí el compañero que trabaje con rutas y middlewares
    // debe implementar la creación de sesión con Redis
    // Por ahora solo devolvemos el usuario
    res.json({ 
      message: "Login exitoso",
      user 
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener perfil del usuario actual
 * GET /api/auth/profile
 * Requiere: Usuario autenticado (req.user debe existir)
 */
export async function getProfile(req, res, next) {
  try {
    // req.user viene del middleware de autenticación
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    const user = await UserService.getById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * Cambiar contraseña
 * POST /api/auth/change-password
 * Body: { oldPassword, newPassword }
 * Requiere: Usuario autenticado
 */
export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: "oldPassword y newPassword son requeridos" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: "La nueva contraseña debe tener al menos 6 caracteres" 
      });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    const updated = await UserService.changePassword(
      req.user._id,
      oldPassword,
      newPassword
    );
    
    if (!updated) {
      return res.status(400).json({ error: "Contraseña actual incorrecta" });
    }
    
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener usuarios por rol
 * GET /api/users/role/:rol
 * Requiere: Admin
 */
export async function getByRol(req, res, next) {
  try {
    const { rol } = req.params;
    
    if (!["lector", "editor", "admin"].includes(rol)) {
      return res.status(400).json({ error: "rol debe ser: lector, editor o admin" });
    }
    
    const users = await UserService.getByRol(rol);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * Logout
 * POST /api/auth/logout
 * Requiere: Usuario autenticado
 */
export async function logout(req, res, next) {
  try {
    // NOTA: El compañero que trabaje con rutas y middlewares
    // debe implementar la destrucción de sesión con Redis aquí
    
    res.json({ message: "Logout exitoso" });
  } catch (err) {
    next(err);
  }
}
