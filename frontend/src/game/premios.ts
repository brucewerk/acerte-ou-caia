import { PremioOuModificador } from "../types";

const PREMIO_TOTAL_COMUM = 300000;
const QTD_FICHAS_DINHEIRO = 17; // + 3 fichas especiais = 20 fichas (2 por duelo x 10 duelos)

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Gera valores em dinheiro que somam exatamente o premio maximo do jogo
 * comum (R$300.000 por padrao), em fichas de tamanhos variados (nao
 * uniformes, para dar a sensacao de fichas pequenas e fichas grandes).
 */
function gerarValoresEmDinheiro(quantidade: number, total: number): number[] {
  const pesos = Array.from({ length: quantidade }, () => Math.random() + 0.2);
  const somaPesos = pesos.reduce((a, b) => a + b, 0);
  const valores = pesos.map((p) => Math.max(100, Math.round(((p / somaPesos) * total) / 100) * 100));

  const somaAtual = valores.reduce((a, b) => a + b, 0);
  valores[valores.length - 1] = Math.max(100, valores[valores.length - 1] + (total - somaAtual));

  return valores;
}

export interface FichaPainel {
  id: string;
  rotulo: string;
  premio: PremioOuModificador;
  revelada: boolean;
}

/**
 * Monta o baralho fixo de fichas de uma partida inteira: as fichas especiais
 * (Vida Extra, Dividir por 2, Perde Tudo) aparecem uma unica vez cada, e as
 * demais fichas fracionam o premio maximo do jogo comum. O baralho ja sai
 * embaralhado e e consumido (sem reposicao) duelo a duelo.
 */
export function montarPoolDeFichas(): FichaPainel[] {
  const valores = gerarValoresEmDinheiro(QTD_FICHAS_DINHEIRO, PREMIO_TOTAL_COMUM);

  const fichas: FichaPainel[] = valores.map((valor, i) => ({
    id: `valor-${i}`,
    rotulo: valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    premio: { tipo: "valor", valor },
    revelada: false,
  }));

  fichas.push({ id: "vida-extra", rotulo: "Vida Extra", premio: { tipo: "vida-extra" }, revelada: false });
  fichas.push({ id: "dividir-por-2", rotulo: "Dividir por 2", premio: { tipo: "dividir-por-2" }, revelada: false });
  fichas.push({ id: "perde-tudo", rotulo: "Perde Tudo", premio: { tipo: "perde-tudo" }, revelada: false });

  return embaralhar(fichas);
}

export function descreverPremio(p: PremioOuModificador): string {
  switch (p.tipo) {
    case "valor":
      return `+ ${p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    case "vida-extra":
      return "Vida extra!";
    case "dividir-por-2":
      return "Dividir por 2";
    case "perde-tudo":
      return "Perde tudo!";
  }
}
