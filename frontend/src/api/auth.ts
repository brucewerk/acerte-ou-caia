import { api } from "./client";

export interface PerfilUsuario {
  id: string;
  email: string;
  nomeJogador: string;
  criadoEm: string;
}

export async function registrar(email: string, nomeJogador: string, senha: string) {
  const { data } = await api.post<{ token: string; usuario: PerfilUsuario }>("/auth/registrar", {
    email,
    nomeJogador,
    senha,
  });
  return data;
}

export async function login(identificador: string, senha: string) {
  const { data } = await api.post<{ token: string; usuario: PerfilUsuario }>("/auth/login", {
    identificador,
    senha,
  });
  return data;
}

export async function buscarPerfil() {
  const { data } = await api.get<PerfilUsuario>("/auth/perfil");
  return data;
}

export async function atualizarPerfil(payload: {
  email?: string;
  nomeJogador?: string;
  senhaAtual?: string;
  novaSenha?: string;
}) {
  const { data } = await api.put<PerfilUsuario>("/auth/perfil", payload);
  return data;
}
