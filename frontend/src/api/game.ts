import { api } from "./client";
import { Pergunta, NivelCPU, ResultadoRanking, Palavra, Afirmacao } from "../types";

export async function buscarPerguntas(quantidade: number, dificuldade?: string): Promise<Pergunta[]> {
  const { data } = await api.get<Pergunta[]>("/questions/random", {
    params: { quantidade, dificuldade },
  });
  return data;
}

export async function buscarPalavras(quantidade: number): Promise<Palavra[]> {
  const { data } = await api.get<Palavra[]>("/palavras/random", { params: { quantidade } });
  return data;
}

export async function buscarAfirmacoes(quantidade: number): Promise<Afirmacao[]> {
  const { data } = await api.get<Afirmacao[]>("/afirmacoes/random", { params: { quantidade } });
  return data;
}

export async function gerarAdversarios(): Promise<{ estacao: number; nivel: NivelCPU }[]> {
  const { data } = await api.get<{ adversarios: { estacao: number; nivel: NivelCPU }[] }>(
    "/game/adversarios"
  );
  return data.adversarios;
}

export async function respostaCPU(nivel: NivelCPU) {
  const { data } = await api.post<{ acertou: boolean; tempoRespostaMs: number; usouTempoLimite: boolean }>(
    "/game/cpu/responder",
    { nivel }
  );
  return data;
}

export async function repassarCPU(nivel: NivelCPU, vidasDisponiveis: number) {
  const { data } = await api.post<{ repassa: boolean }>("/game/cpu/repassar", {
    nivel,
    vidasDisponiveis,
  });
  return data.repassa;
}

export async function moedaCPU() {
  const { data } = await api.get<{ moeda: 0 | 1 }>("/game/cpu/moeda");
  return data.moeda;
}

export async function decisaoFinalCPU(nivel: NivelCPU) {
  const { data } = await api.post<{ arrisca: boolean }>("/game/cpu/decisao-final", { nivel });
  return data.arrisca;
}

export async function registrarResultado(payload: {
  jogador: string;
  premioFinal: number;
  duelosVencidos: number;
  chegouAoDesafioFinal: boolean;
  dobrouPremio: boolean;
}) {
  const { data } = await api.post("/game/resultado", payload);
  return data;
}

export async function buscarRanking(): Promise<ResultadoRanking[]> {
  const { data } = await api.get<ResultadoRanking[]>("/ranking");
  return data;
}
