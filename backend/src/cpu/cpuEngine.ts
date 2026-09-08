import { NivelCPU, PerfilCPU } from "../types";

/**
 * Perfis de inteligencia da CPU.
 * "genio"   -> erra em media 1 a cada 25 perguntas (taxa de acerto 0.96)
 * "mediano" -> erra em media 1 a cada 12 perguntas (taxa de acerto 0.92)
 * "fraco"   -> erra em media 1 a cada 5  perguntas (taxa de acerto 0.80)
 *
 * O delay simula o tempo que o oponente demora para "decidir" a resposta,
 * dentro do limite de 30s do relogio do programa.
 */
export const PERFIS_CPU: Record<NivelCPU, PerfilCPU> = {
  genio: { nivel: "genio", taxaAcerto: 0.96, delayMinMs: 2000, delayMaxMs: 14000 },
  mediano: { nivel: "mediano", taxaAcerto: 0.92, delayMinMs: 3000, delayMaxMs: 20000 },
  fraco: { nivel: "fraco", taxaAcerto: 0.8, delayMinMs: 4000, delayMaxMs: 28000 },
};

const NIVEIS: NivelCPU[] = ["genio", "mediano", "fraco"];

/** Sorteia um nivel de inteligencia para uma estacao da CPU (1 a 10). */
export function sortearNivelCPU(): NivelCPU {
  const pesos = { genio: 0.3, mediano: 0.45, fraco: 0.25 };
  const r = Math.random();
  if (r < pesos.genio) return "genio";
  if (r < pesos.genio + pesos.mediano) return "mediano";
  return "fraco";
}

/** Gera os 10 adversarios de uma partida com niveis variados de dificuldade. */
export function gerarAdversarios(quantidade = 10) {
  return Array.from({ length: quantidade }, (_, i) => ({
    estacao: i + 1,
    nivel: sortearNivelCPU(),
  }));
}

interface ResultadoDecisaoCPU {
  acertou: boolean;
  tempoRespostaMs: number;
  usouTempoLimite: boolean; // true se estourou os 30s (equivale a errar)
}

/**
 * Decide se a CPU acerta a pergunta atual e quanto tempo ela "gasta"
 * para responder, respeitando o limite de 30 segundos do relogio.
 */
export function decidirRespostaCPU(nivel: NivelCPU): ResultadoDecisaoCPU {
  const perfil = PERFIS_CPU[nivel];
  const LIMITE_MS = 30000;

  const acertou = Math.random() < perfil.taxaAcerto;

  const janela = perfil.delayMaxMs - perfil.delayMinMs;
  let tempoRespostaMs = perfil.delayMinMs + Math.random() * janela;

  // Quando erra, ha uma chance de estourar o tempo em vez de responder errado
  // dentro do prazo -- ambos os casos levam a queda, mas variam a dramaticidade.
  let usouTempoLimite = false;
  if (!acertou && Math.random() < 0.35) {
    tempoRespostaMs = LIMITE_MS;
    usouTempoLimite = true;
  }

  tempoRespostaMs = Math.min(tempoRespostaMs, LIMITE_MS);

  return { acertou, tempoRespostaMs, usouTempoLimite };
}

/**
 * Decide se a CPU, quando esta na lideranca com "vidas" disponiveis,
 * opta por repassar uma pergunta dificil para o desafiante.
 * Fica mais cauteloso (repassa mais) quanto menor o nivel.
 */
export function cpuDecideRepassarPergunta(nivel: NivelCPU, vidasDisponiveis: number): boolean {
  if (vidasDisponiveis <= 0) return false;
  const chanceRepasse = { genio: 0.1, mediano: 0.25, fraco: 0.45 }[nivel];
  return Math.random() < chanceRepasse;
}

/** Decide qual moeda (0 = ouro, 1 = prata) a CPU escolhe apos vencer um duelo. */
export function cpuEscolheMoeda(): 0 | 1 {
  return Math.random() < 0.5 ? 0 : 1;
}

/**
 * Decide se a CPU, ao chegar na Grande Decisao, para com metade do premio
 * ou arrisca no desafio final. CPUs mais fortes arriscam mais.
 */
export function cpuDecideArriscarFinal(nivel: NivelCPU): boolean {
  const chanceArriscar = { genio: 0.65, mediano: 0.45, fraco: 0.25 }[nivel];
  return Math.random() < chanceArriscar;
}
