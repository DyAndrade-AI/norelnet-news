import axios from "axios";

// Instancia compartida de Axios; usa withCredentials para enviar cookies de sesión.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});
