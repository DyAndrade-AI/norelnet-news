import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

export const UserService = {
  /**
   * Listar todos los usuarios (sin contraseñas)
   * @returns {Promise<Array>} Lista de usuarios
   */
  async list() {
    return User.find()
      .select("-password_hash") // No devolver contraseñas
      .sort({ fecha_registro: -1 })
      .lean();
  },

  /**
   * Obtener usuario por ID (sin contraseña)
   * @param {string} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async getById(id) {
    return User.findById(id)
      .select("-password_hash")
      .lean();
  },

  /**
   * Obtener usuario por email (CON contraseña, para login)
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario con password_hash o null
   */
  async getByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).lean();
  },

  /**
   * Crear nuevo usuario
   * @param {Object} payload - Datos del usuario
   * @param {string} payload.nombre - Nombre completo
   * @param {string} payload.email - Email único
   * @param {string} payload.password - Contraseña en texto plano (se hasheará)
   * @param {string} payload.rol - Rol del usuario (opcional, default: "lector")
   * @returns {Promise<Object>} Usuario creado (sin password_hash)
   */
  async create(payload) {
    const { nombre, email, password, rol = "lector" } = payload;
    
    // Validar que el email no exista
    const existingUser = await this.getByEmail(email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }
    
    // Hashear contraseña con bcrypt (10 rounds)
    const password_hash = await bcrypt.hash(password, 10);
    
    const doc = await User.create({
      nombre,
      email: email.toLowerCase(),
      password_hash,
      rol
    });
    
    // Devolver sin el hash
    const user = doc.toObject();
    delete user.password_hash;
    return user;
  },

  /**
   * Actualizar usuario existente
   * @param {string} id - ID del usuario
   * @param {Object} payload - Datos a actualizar
   * @returns {Promise<Object|null>} Usuario actualizado o null
   */
  async update(id, payload) {
    // Si viene nueva contraseña, hashearla
    if (payload.password) {
      payload.password_hash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }
    
    // Si viene email, convertirlo a minúsculas
    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }
    
    return User.findByIdAndUpdate(id, payload, { new: true })
      .select("-password_hash")
      .lean();
  },

  /**
   * Eliminar usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  async remove(id) {
    const deleted = await User.findByIdAndDelete(id).lean();
    return !!deleted;
  },

  /**
   * Verificar credenciales de login
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object|null>} Usuario (sin password_hash) si las credenciales son correctas, null si no
   */
  async verifyPassword(email, password) {
    const user = await this.getByEmail(email);
    if (!user) return null;
    
    // Comparar contraseña con bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    // Devolver usuario sin el hash
    delete user.password_hash;
    return user;
  },

  /**
   * Cambiar contraseña de un usuario
   * @param {string} id - ID del usuario
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object|null>} Usuario actualizado o null si la contraseña actual es incorrecta
   */
  async changePassword(id, oldPassword, newPassword) {
    const user = await User.findById(id).lean();
    if (!user) return null;
    
    // Verificar contraseña actual
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) return null;
    
    // Actualizar con nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    return User.findByIdAndUpdate(
      id,
      { password_hash: newPasswordHash },
      { new: true }
    )
      .select("-password_hash")
      .lean();
  },

  /**
   * Obtener usuarios por rol
   * @param {string} rol - Rol a filtrar ("lector", "editor", "admin")
   * @returns {Promise<Array>} Lista de usuarios con ese rol
   */
  async getByRol(rol) {
    return User.find({ rol })
      .select("-password_hash")
      .sort({ fecha_registro: -1 })
      .lean();
  },

  /**
   * Número total de usuarios
   * @returns {Promise<number>}
   */
  async count() {
    return User.countDocuments();
  }
};
