import { Adversario, NivelCPU } from "../types";

export interface Persona {
  nome: string;
  emoji: string;
  frase: string;
}

/**
 * Personas dos adversarios controlados por CPU. Cada partida sorteia 10
 * personas unicas entre esta lista para dar personalidade as 10 estacoes.
 */
const PERSONAS: Persona[] = [
  { nome: "Dona Marisa", emoji: "🧓", frase: "Jogo palavras cruzadas desde 1985!" },
  { nome: "Kadu Sagaz", emoji: "🧑‍🎓", frase: "Estudei pra essa prova a vida inteira." },
  { nome: "Bibi Estrela", emoji: "💃", frase: "Vim pro palco pra brilhar!" },
  { nome: "Seu Waldemar", emoji: "👴", frase: "Ja vi de tudo nessa vida, rapaz." },
  { nome: "Duda Craque", emoji: "⚽", frase: "Bola pra frente e resposta na trave!" },
  { nome: "Rafa Nerd", emoji: "🤓", frase: "Curiosidades sao meu esporte favorito." },
  { nome: "Cacau Doce", emoji: "🍫", frase: "Nervoso? Eu? Trouxe brigadeiro pra sorte." },
  { nome: "Thiaguinho Sortudo", emoji: "🍀", frase: "Hoje o dia e meu, sinto no ar!" },
  { nome: "Vovo Zeferina", emoji: "👵", frase: "Netos, olhem so a vovo mandando bem." },
  { nome: "Bruno Turbo", emoji: "⚡", frase: "Respondo antes de voce terminar de ler!" },
  { nome: "Lia Enigma", emoji: "🔮", frase: "Ja sabia que ia cair essa pergunta." },
  { nome: "Zeca Trovao", emoji: "🌩️", frase: "Vim pra derrubar todo mundo hoje!" },
  { nome: "Fifi Glamour", emoji: "💅", frase: "Alcapao nao combina com o meu look." },
  { nome: "Painho Ligeiro", emoji: "🤠", frase: "Devagar e sempre? Nao aqui!" },
  { nome: "Cacilda Fera", emoji: "🐯", frase: "Pode perguntar, eu nao tremo." },
];

// Personas "reservadas" simbolicamente para cada faixa de inteligencia, so
// para dar uma dica de humor visual (nao interfere na logica do jogo).
const EMOJI_POR_NIVEL: Record<NivelCPU, string> = {
  genio: "🧠",
  mediano: "🙂",
  fraco: "😅",
};

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Atribui uma persona unica e aleatoria a cada adversario da partida. */
export function atribuirPersonas(
  adversarios: { estacao: number; nivel: NivelCPU }[]
): Adversario[] {
  const personasSorteadas = embaralhar(PERSONAS).slice(0, adversarios.length);

  return adversarios.map((a, i) => {
    const persona = personasSorteadas[i] ?? PERSONAS[i % PERSONAS.length];
    return {
      ...a,
      derrotado: false,
      nome: persona.nome,
      emoji: persona.emoji,
      frase: persona.frase,
      emojiNivel: EMOJI_POR_NIVEL[a.nivel],
    };
  });
}
