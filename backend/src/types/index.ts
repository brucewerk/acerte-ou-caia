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

export interface IQuestionBase {
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  categoria: Categoria;
  dificuldade: Dificuldade;
  ativa: boolean;
}

export type NivelCPU = "genio" | "mediano" | "fraco";

export interface PerfilCPU {
  nivel: NivelCPU;
  taxaAcerto: number;
  delayMinMs: number;
  delayMaxMs: number;
}
