/** Utilitarios para interpretar a fala do jogador como uma resposta do jogo. */

function normalizarFala(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[.,!?]/g, "")
    .trim();
}

const PALAVRAS_POR_OPCAO = [
  ["UM", "UMA", "PRIMEIRA", "PRIMEIRO", "LETRA A", "OPCAO A", "OPCAO UM", "A"],
  ["DOIS", "DUAS", "SEGUNDA", "SEGUNDO", "LETRA B", "OPCAO B", "OPCAO DOIS", "B"],
  ["TRES", "TERCEIRA", "TERCEIRO", "LETRA C", "OPCAO C", "OPCAO TRES", "C"],
  ["QUATRO", "QUARTA", "QUARTO", "LETRA D", "OPCAO D", "OPCAO QUATRO", "D"],
];

/** Tenta casar a fala do jogador com uma das 4 opcoes de multipla escolha. */
export function combinarRespostaMultiplaEscolha(transcricao: string, opcoes: string[]): number | null {
  const t = normalizarFala(transcricao);
  if (!t) return null;

  for (let i = 0; i < PALAVRAS_POR_OPCAO.length; i++) {
    if (PALAVRAS_POR_OPCAO[i].includes(t)) return i;
  }

  for (let i = 0; i < opcoes.length; i++) {
    const opcaoNorm = normalizarFala(opcoes[i]);
    if (opcaoNorm.length >= 3 && (t.includes(opcaoNorm) || opcaoNorm.includes(t))) return i;
  }
  return null;
}

/** Tenta casar a fala do jogador com Verdadeiro/Sim ou Falso/Nao. */
export function combinarSimOuNao(transcricao: string): boolean | null {
  const t = normalizarFala(transcricao);
  if (["SIM", "VERDADEIRO", "VERDADEIRA", "CERTO", "CORRETO"].some((p) => t.includes(p))) return true;
  if (["NAO", "FALSO", "FALSA", "ERRADO", "INCORRETO"].some((p) => t.includes(p))) return false;
  return null;
}

function distanciaLevenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** Tenta casar a fala do jogador com a palavra-alvo da rodada Letras Embaralhadas
 * (com tolerancia de 1 letra de diferenca para palavras mais longas). */
export function combinarPalavra(transcricao: string, palavraAlvo: string): boolean {
  const t = normalizarFala(transcricao).replace(/\s+/g, "");
  const alvo = normalizarFala(palavraAlvo).replace(/\s+/g, "");
  if (!t) return false;
  if (t === alvo) return true;
  if (alvo.length >= 5) return distanciaLevenshtein(t, alvo) <= 1;
  return false;
}
