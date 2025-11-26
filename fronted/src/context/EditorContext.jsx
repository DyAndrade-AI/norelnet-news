// src/context/EditorContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

// Contexto principal para autenticación + helpers del modo editor.

const Ctx = createContext(null);

export function EditorProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/auth/profile")
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, name) => {
    await api.post("/api/auth/register", { email, password, name });
    return await login(email, password);
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  const isEditor = !!user && (user.rol === "editor" || user.rol === "admin");
  const isAdmin = !!user && user.rol === "admin";

  // admin tools
  const searchUsers = async ({ q = "", page = 1, limit = 10 }) => {
    const { data } = await api.get("/api/users", { params: { q, page, limit } });
    return data;
  };
  const grantRole = async (userId, role) => {
    const { data } = await api.patch(`/api/users/${userId}/role`, { role });
    return data.user;
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, isEditor, isAdmin, searchUsers, grantRole }}>
      {children}
    </Ctx.Provider>
  );
}

export const useEditor = () => useContext(Ctx);
