import axios from "axios";

const CHAVE_TOKEN = "aoc_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

// Anexa automaticamente o token do jogador logado, quando existir.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiAdmin(chaveAdmin: string) {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    headers: { "Content-Type": "application/json", "x-admin-key": chaveAdmin },
  });
}
