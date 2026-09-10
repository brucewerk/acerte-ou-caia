import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import {
  PerfilUsuario,
  registrar as apiRegistrar,
  login as apiLogin,
  buscarPerfil,
  atualizarPerfil as apiAtualizarPerfil,
} from "../api/auth";

const CHAVE_TOKEN = "aoc_token";

interface AuthContextValor {
  usuario: PerfilUsuario | null;
  carregando: boolean;
  registrar: (email: string, nomeJogador: string, senha: string) => Promise<void>;
  login: (identificador: string, senha: string) => Promise<void>;
  logout: () => void;
  atualizarPerfil: (payload: {
    email?: string;
    nomeJogador?: string;
    senhaAtual?: string;
    novaSenha?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(CHAVE_TOKEN);
    if (!token) {
      setCarregando(false);
      return;
    }
    buscarPerfil()
      .then(setUsuario)
      .catch(() => localStorage.removeItem(CHAVE_TOKEN))
      .finally(() => setCarregando(false));
  }, []);

  const registrar = useCallback(async (email: string, nomeJogador: string, senha: string) => {
    const { token, usuario: perfil } = await apiRegistrar(email, nomeJogador, senha);
    localStorage.setItem(CHAVE_TOKEN, token);
    setUsuario(perfil);
  }, []);

  const login = useCallback(async (identificador: string, senha: string) => {
    const { token, usuario: perfil } = await apiLogin(identificador, senha);
    localStorage.setItem(CHAVE_TOKEN, token);
    setUsuario(perfil);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CHAVE_TOKEN);
    setUsuario(null);
  }, []);

  const atualizarPerfilCtx = useCallback(
    async (payload: { email?: string; nomeJogador?: string; senhaAtual?: string; novaSenha?: string }) => {
      const perfil = await apiAtualizarPerfil(payload);
      setUsuario(perfil);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, registrar, login, logout, atualizarPerfil: atualizarPerfilCtx }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  return ctx;
}
