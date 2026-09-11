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
 * Gera valores em dinheiro "redondos" (multiplos de R$1.000) que somam
 * exatamente o premio maximo do jogo comum, em fichas de tamanhos variados
 * (nao uniformes, para dar a sensacao de fichas pequenas e fichas grandes).
 */
function gerarValoresEmDinheiro(quantidade: number, total: number): number[] {
  const pesos = Array.from({ length: quantidade }, () => Math.random() + 0.2);
  const somaPesos = pesos.reduce((a, b) => a + b, 0);
  const valores = pesos.map((p) => Math.max(1000, Math.round(((p / somaPesos) * total) / 1000) * 1000));

  const somaAtual = valores.reduce((a, b) => a + b, 0);
  const diferenca = total - somaAtual; // sempre multiplo de 1000, pois todos os valores sao multiplos de 1000

  // Aplica a diferenca de arredondamento na maior ficha, mantendo todos os valores redondos.
  let indiceMaior = 0;
  for (let i = 1; i < valores.length; i++) {
    if (valores[i] > valores[indiceMaior]) indiceMaior = i;
  }
  valores[indiceMaior] = Math.max(1000, valores[indiceMaior] + diferenca);

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

/** Atribui uma pontuacao aproximada a um premio, so para comparar duas fichas entre si
 * (ex.: dizer ao jogador se a escolha dele foi boa ou ruim em relacao a moeda descartada). */
export function pontuarPremio(p: PremioOuModificador): number {
  switch (p.tipo) {
    case "valor":
      return p.valor;
    case "vida-extra":
      return 20000; // equivalente a uma ficha de bom valor
    case "dividir-por-2":
      return -10000;
    case "perde-tudo":
      return -1000000;
  }
}
