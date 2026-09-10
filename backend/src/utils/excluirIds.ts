import { Types } from "mongoose";

/**
 * Converte o parametro de query "excluir" (lista de ids separados por
 * virgula) em ObjectIds validos, para que as rotas de sorteio (perguntas,
 * palavras, afirmacoes) possam evitar repetir conteudo ja usado na mesma
 * partida.
 */
export function parseIdsExcluidos(valor: unknown): Types.ObjectId[] {
  if (typeof valor !== "string" || !valor.trim()) return [];
  return valor
    .split(",")
    .map((id) => id.trim())
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
}
