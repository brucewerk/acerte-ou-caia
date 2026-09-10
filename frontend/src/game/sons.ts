/**
 * Sistema de efeitos sonoros do jogo, sintetizados em tempo real via Web
 * Audio API. Nao depende de nenhum arquivo de audio externo — funciona
 * offline e evita qualquer questao de licenciamento de faixas prontas.
 */

let contexto: AudioContext | null = null;
let mudo = localStorage.getItem("aoc_mudo") === "true";

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    contexto = new AudioCtx();
  }
  if (contexto.state === "suspended") {
    contexto.resume().catch(() => {});
  }
  return contexto;
}

interface OpcoesTom {
  frequencia: number;
  duracao: number;
  atraso?: number;
  tipo?: OscillatorType;
  volume?: number;
  deslizarPara?: number;
}

function tocarTom({ frequencia, duracao, atraso = 0, tipo = "sine", volume = 0.2, deslizarPara }: OpcoesTom) {
  if (mudo) return;
  const ctx = obterContexto();
  if (!ctx) return;

  const inicio = ctx.currentTime + atraso;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = tipo;
  osc.frequency.setValueAtTime(frequencia, inicio);
  if (deslizarPara) {
    osc.frequency.linearRampToValueAtTime(deslizarPara, inicio + duracao);
  }

  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(volume, inicio + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(inicio);
  osc.stop(inicio + duracao + 0.05);
}

export const sons = {
  /** Toque curto de clique/selecao (UI geral). */
  clique() {
    tocarTom({ frequencia: 520, duracao: 0.06, tipo: "triangle", volume: 0.12 });
  },
  /** Resposta correta: acorde ascendente e alegre. */
  acerto() {
    tocarTom({ frequencia: 523.25, duracao: 0.14, tipo: "sine", volume: 0.18 });
    tocarTom({ frequencia: 659.25, duracao: 0.16, atraso: 0.08, tipo: "sine", volume: 0.18 });
    tocarTom({ frequencia: 783.99, duracao: 0.22, atraso: 0.16, tipo: "sine", volume: 0.2 });
  },
  /** Resposta errada: zumbido curto e grave. */
  erro() {
    tocarTom({ frequencia: 220, duracao: 0.28, tipo: "sawtooth", volume: 0.15, deslizarPara: 130 });
  },
  /** Queda no alcapao: whoosh descendente. */
  queda() {
    tocarTom({ frequencia: 400, duracao: 0.6, tipo: "sawtooth", volume: 0.16, deslizarPara: 60 });
  },
  /** Escolha/reveal de moeda. */
  moeda() {
    tocarTom({ frequencia: 880, duracao: 0.1, tipo: "square", volume: 0.12 });
    tocarTom({ frequencia: 1200, duracao: 0.18, atraso: 0.09, tipo: "square", volume: 0.14 });
  },
  /** Tique-taque nos ultimos segundos do relogio. */
  tique() {
    tocarTom({ frequencia: 1000, duracao: 0.05, tipo: "square", volume: 0.08 });
  },
  /** Fanfarra curta de vitoria (fim de jogo com premio). */
  vitoria() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      tocarTom({ frequencia: freq, duracao: 0.22, atraso: i * 0.12, tipo: "triangle", volume: 0.2 })
    );
  },
  /** Alternancia de turno (vez do adversario). */
  turno() {
    tocarTom({ frequencia: 330, duracao: 0.1, tipo: "sine", volume: 0.1 });
  },

  estaMudo(): boolean {
    return mudo;
  },
  alternarMudo(): boolean {
    mudo = !mudo;
    localStorage.setItem("aoc_mudo", String(mudo));
    return mudo;
  },
};
