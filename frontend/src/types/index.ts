export type Categoria =
  | "geografia"
  | "historia"
  | "ciencias"
  | "esportes"
  | "entretenimento"
  | "cultura-geral"
  | "artes"
  | "atualidades";

export type Dificuldade = "facil" | "medio" | "dificil";

export interface Pergunta {
  _id: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  categoria: Categoria;
  dificuldade: Dificuldade;
  ativa: boolean;
}

export type NivelCPU = "genio" | "mediano" | "fraco";

export interface Adversario {
  estacao: number;
  nivel: NivelCPU;
  derrotado: boolean;
  nome: string;
  emoji: string;
  frase: string;
  emojiNivel: string;
}

export type Moeda = "ouro" | "prata";

export type PremioOuModificador =
  | { tipo: "valor"; valor: number }
  | { tipo: "vida-extra" }
  | { tipo: "dividir-por-2" }
  | { tipo: "perde-tudo" };

export interface Palavra {
  _id: string;
  palavra: string;
  dica: string;
  categoria: string;
  ativa: boolean;
}

export interface Afirmacao {
  _id: string;
  afirmacao: string;
  verdadeira: boolean;
  categoria: string;
  ativa: boolean;
}

export type TipoRodada = "multipla-escolha" | "letras-embaralhadas" | "sim-ou-nao";

export type Turno = "lider" | "adversario";

export type FaseJogo =
  | "tela-inicial"
  | "sorteio-lider"
  | "escolhendo-adversario"
  | "duelo"
  | "escolha-moeda"
  | "resultado-moeda"
  | "grande-decisao"
  | "desafio-final"
  | "fim-vitoria"
  | "fim-queda";

export interface EstadoJogador {
  nome: string;
  vidas: number;
  premio: number;
  duelosVencidos: number;
}

export interface ResultadoRanking {
  _id: string;
  jogador: string;
  premioFinal: number;
  duelosVencidos: number;
  chegouAoDesafioFinal: boolean;
  dobrouPremio: boolean;
  data: string;
}
