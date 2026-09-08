import { useEffect, useMemo, useRef, useState } from "react";
import { Palavra } from "../types";
import { Timer } from "./Timer";

interface LetrasEmbaralhadasProps {
  palavra: Palavra;
  chave: string;
  onResultado: (sucesso: boolean) => void;
  onEsgotarTempo: () => void;
  bloqueado: boolean;
}

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function normalizar(txt: string) {
  return txt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function calcularRevelacaoInicial(letras: string[]) {
  return letras.map((letra, i) => {
    if (letra === " ") return true;
    if (i === 0) return true;
    return Math.random() < 0.35;
  });
}

/**
 * Rodada especial "Letras Embaralhadas": a palavra aparece com parte das
 * letras reveladas e o jogador pode completar as lacunas de duas formas:
 * clicando (ou digitando pelo teclado fisico) letra por letra, ou digitando
 * a palavra inteira no campo de palpite - se digitada corretamente, vale
 * na hora, mesmo que nem todas as letras tenham sido clicadas antes.
 */
export function LetrasEmbaralhadas({
  palavra,
  chave,
  onResultado,
  onEsgotarTempo,
  bloqueado,
}: LetrasEmbaralhadasProps) {
  const letrasPalavra = useMemo(() => normalizar(palavra.palavra).split(""), [palavra]);

  const [reveladas, setReveladas] = useState<boolean[]>(() => calcularRevelacaoInicial(letrasPalavra));
  const [letrasErradas, setLetrasErradas] = useState<string[]>([]);
  const [palpite, setPalpite] = useState("");
  const [encerrado, setEncerrado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reinicia todo o estado interno sempre que uma nova palavra entra em jogo
  // (necessario porque o componente pode permanecer montado entre rodadas).
  useEffect(() => {
    setReveladas(calcularRevelacaoInicial(letrasPalavra));
    setLetrasErradas([]);
    setPalpite("");
    setEncerrado(false);
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palavra._id]);

  const letrasFaltantes = new Set(letrasPalavra.filter((l, i) => l !== " " && !reveladas[i]));

  function revelarLetra(letra: string, novasReveladas: boolean[]) {
    setReveladas(novasReveladas);
    const completou = letrasPalavra.every((l, i) => l === " " || novasReveladas[i]);
    if (completou) {
      setEncerrado(true);
      setTimeout(() => onResultado(true), 500);
    }
  }

  function clicarLetra(letra: string) {
    if (bloqueado || encerrado) return;

    if (!letrasFaltantes.has(letra)) {
      setEncerrado(true);
      setLetrasErradas((prev) => [...prev, letra]);
      setTimeout(() => onResultado(false), 700);
      return;
    }

    const novasReveladas = letrasPalavra.map((l, i) => (l === letra ? true : reveladas[i]));
    revelarLetra(letra, novasReveladas);
  }

  function conferirPalpiteCompleto(valor: string) {
    if (bloqueado || encerrado) return;
    const normalizado = normalizar(valor).trim();
    const alvo = letrasPalavra.join("");
    if (normalizado.length === 0) return;

    if (normalizado === alvo) {
      setEncerrado(true);
      setReveladas(letrasPalavra.map(() => true));
      setTimeout(() => onResultado(true), 400);
    } else if (normalizado.length >= alvo.length) {
      // Palavra completa digitada, porem incorreta: conta como erro, como no resto do jogo.
      setEncerrado(true);
      setTimeout(() => onResultado(false), 400);
    }
  }

  // Suporte a teclado fisico: letras avulsas preenchem lacunas, Enter confere o palpite do campo de texto.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (bloqueado || encerrado) return;
      if (document.activeElement === inputRef.current) return; // o campo de palpite trata suas proprias teclas
      const letra = e.key.toUpperCase();
      if (letra.length === 1 && letra >= "A" && letra <= "Z") {
        clicarLetra(letra);
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloqueado, encerrado, reveladas, letrasFaltantes]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <Timer duracaoMs={30000} ativo={!bloqueado && !encerrado} onEsgotar={onEsgotarTempo} chave={chave} />

      <div className="bg-palco-800 border border-palco-700 rounded-2xl p-6 sm:p-8 text-center flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wide text-ouro-400/80">
          Letras Embaralhadas · {palavra.categoria}
        </span>
        <p className="text-creme/70 text-sm">{palavra.dica}</p>

        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {letrasPalavra.map((letra, i) =>
            letra === " " ? (
              <div key={i} className="w-4" />
            ) : (
              <div
                key={i}
                className={`h-10 w-8 sm:h-12 sm:w-10 rounded-md flex items-center justify-center titulo-jogo text-lg transition-colors
                  ${reveladas[i] ? "bg-acerto-500/20 border border-acerto-500 text-acerto-400" : "bg-palco-900 border border-palco-700"}`}
              >
                {reveladas[i] ? letra : ""}
              </div>
            )
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          conferirPalpiteCompleto(palpite);
        }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          value={palpite}
          onChange={(e) => setPalpite(e.target.value)}
          disabled={bloqueado || encerrado}
          placeholder="Ou digite a palavra inteira e aperte Enter"
          className="flex-1 px-4 py-3 rounded-lg bg-palco-800 border border-palco-700 focus:border-ouro-500 outline-none uppercase tracking-wide disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={bloqueado || encerrado || !palpite.trim()}
          className="px-5 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
        >
          Confirmar
        </button>
      </form>

      <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
        {ALFABETO.map((letra) => {
          const jaRevelada = letrasPalavra.some((l, i) => l === letra && reveladas[i]);
          const jaErrada = letrasErradas.includes(letra);
          return (
            <button
              key={letra}
              type="button"
              disabled={bloqueado || encerrado || jaRevelada || jaErrada}
              onClick={() => clicarLetra(letra)}
              className={`aspect-square rounded-lg font-semibold text-sm border transition-colors
                ${jaRevelada ? "bg-acerto-500/20 border-acerto-500 text-acerto-400" : ""}
                ${jaErrada ? "bg-queda-500/20 border-queda-500 text-queda-500" : ""}
                ${!jaRevelada && !jaErrada ? "bg-palco-800 border-palco-700 hover:border-ouro-500 hover:bg-palco-700" : ""}
                disabled:cursor-not-allowed`}
            >
              {letra}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-center text-creme/40">
        Dica: use o teclado do computador para clicar as letras mais rapido, ou digite a palavra
        completa no campo acima.
      </p>
    </div>
  );
}
