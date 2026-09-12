import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Palavra } from "../types";
import { Timer } from "./Timer";

interface LetrasEmbaralhadasProps {
  palavra: Palavra;
  chave: string;
  onResultado?: (sucesso: boolean) => void;
  onEsgotarTempo?: () => void;
  bloqueado: boolean;
  /** Modo somente-leitura usado para mostrar a CPU "jogando" a mesma rodada. */
  espectador?: boolean;
  /** Quando espectador=true, indica se a CPU acertou a palavra. */
  sucessoEspectador?: boolean;
}

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const GAP_PX = 4; // espaco entre caixas (mantido em sincronia com o gap do CSS abaixo)
const CAIXA_MIN_PX = 15;
const CAIXA_MAX_PX = 44;

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
 * Mede a largura real disponivel no container (via ResizeObserver) e devolve
 * o tamanho de caixa ideal para que todas as letras caibam SEMPRE em uma
 * unica linha, sem depender de estimativas de vw que ignoram padding real.
 */
function useTamanhoDeCaixa(quantidadeCaixas: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tamanho, setTamanho] = useState(CAIXA_MAX_PX);

  useLayoutEffect(() => {
    const elemento = containerRef.current;
    if (!elemento) return;

    function recalcular(largura: number) {
      const espacoParaGaps = GAP_PX * Math.max(quantidadeCaixas - 1, 0);
      const largurabruta = (largura - espacoParaGaps) / Math.max(quantidadeCaixas, 1);
      const novoTamanho = Math.floor(Math.min(Math.max(largurabruta, CAIXA_MIN_PX), CAIXA_MAX_PX));
      setTamanho(novoTamanho);
    }

    recalcular(elemento.clientWidth);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) recalcular(entry.contentRect.width);
    });
    observer.observe(elemento);
    return () => observer.disconnect();
  }, [quantidadeCaixas]);

  return { containerRef, tamanho };
}

export function LetrasEmbaralhadas({
  palavra,
  chave,
  onResultado = () => {},
  onEsgotarTempo = () => {},
  bloqueado,
  espectador = false,
  sucessoEspectador = false,
}: LetrasEmbaralhadasProps) {
  const letrasPalavra = useMemo(() => normalizar(palavra.palavra).split(""), [palavra]);
  const letrasVisiveisCount = letrasPalavra.length;
  const { containerRef, tamanho } = useTamanhoDeCaixa(letrasVisiveisCount);

  const [reveladas, setReveladas] = useState<boolean[]>(() => calcularRevelacaoInicial(letrasPalavra));
  const [letrasErradas, setLetrasErradas] = useState<string[]>([]);
  const [palpite, setPalpite] = useState("");
  const [encerrado, setEncerrado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (espectador) return;
    setReveladas(calcularRevelacaoInicial(letrasPalavra));
    setLetrasErradas([]);
    setPalpite("");
    setEncerrado(false);
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palavra._id, espectador]);

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
    if (espectador || bloqueado || encerrado) return;

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
    if (espectador || bloqueado || encerrado) return;
    const normalizado = normalizar(valor).trim();
    const alvo = letrasPalavra.join("");
    if (normalizado.length === 0) return;

    if (normalizado === alvo) {
      setEncerrado(true);
      setReveladas(letrasPalavra.map(() => true));
      setTimeout(() => onResultado(true), 400);
    } else if (normalizado.length >= alvo.length) {
      setEncerrado(true);
      setTimeout(() => onResultado(false), 400);
    }
  }

  useEffect(() => {
    if (espectador) return;
    function aoTeclar(e: KeyboardEvent) {
      if (bloqueado || encerrado) return;
      if (document.activeElement === inputRef.current) return;
      const letra = e.key.toUpperCase();
      if (letra.length === 1 && letra >= "A" && letra <= "Z") {
        clicarLetra(letra);
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloqueado, encerrado, reveladas, letrasFaltantes, espectador]);

  // Posicao "presa" da CPU quando ela erra (nao usada quando sucessoEspectador=true).
  const indiceTravado = useMemo(() => {
    const posicoesValidas = letrasPalavra
      .map((l, i) => (l !== " " ? i : -1))
      .filter((i) => i >= 0);
    return posicoesValidas[Math.floor(posicoesValidas.length * 0.7)] ?? posicoesValidas[0];
  }, [letrasPalavra]);

  const fonteTamanho = Math.max(9, Math.round(tamanho * 0.52));

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {!espectador && (
        <Timer duracaoMs={30000} ativo={!bloqueado && !encerrado} onEsgotar={onEsgotarTempo} chave={chave} />
      )}

      <div className="bg-palco-800 border border-palco-700 rounded-2xl p-4 sm:p-6 text-center flex flex-col gap-3 shadow-holofote">
        <span className="text-xs uppercase tracking-wide text-ouro-400/80">
          Letras Embaralhadas · {palavra.categoria}
        </span>
        <p className="text-creme/70 text-sm">{palavra.dica}</p>

        <div
          ref={containerRef}
          className="flex flex-nowrap justify-center items-center mt-2 w-full"
          style={{ gap: `${GAP_PX}px` }}
        >
          {letrasPalavra.map((letra, i) => {
            if (letra === " ") return <div key={i} style={{ width: tamanho * 0.4 }} />;

            const mostrarLetra = espectador
              ? sucessoEspectador || i !== indiceTravado
              : reveladas[i];
            const travadaComErro = espectador && !sucessoEspectador && i === indiceTravado;

            return (
              <div
                key={i}
                style={{
                  width: tamanho,
                  height: tamanho * 1.2,
                  fontSize: fonteTamanho,
                  animationDelay: espectador ? `${i * 90}ms` : undefined,
                }}
                className={`shrink-0 rounded-md flex items-center justify-center font-display leading-none transition-colors
                  ${espectador ? "animate-entrada opacity-0" : ""}
                  ${travadaComErro ? "bg-queda-500/20 border border-queda-500 text-queda-500 animate-pulse" : ""}
                  ${!travadaComErro && mostrarLetra ? "bg-acerto-500/20 border border-acerto-500 text-acerto-400" : ""}
                  ${!travadaComErro && !mostrarLetra ? "bg-palco-900 border border-palco-700" : ""}
                `}
              >
                {travadaComErro ? "?" : mostrarLetra ? letra : ""}
              </div>
            );
          })}
        </div>
      </div>

      {!espectador && (
        <>
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
              className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-palco-800 border border-palco-700 focus:border-ouro-500 outline-none uppercase tracking-wide disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={bloqueado || encerrado || !palpite.trim()}
              className="shrink-0 px-4 sm:px-5 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
            >
              OK
            </button>
          </form>

          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2">
            {ALFABETO.map((letra) => {
              const jaRevelada = letrasPalavra.some((l, i) => l === letra && reveladas[i]);
              const jaErrada = letrasErradas.includes(letra);
              return (
                <button
                  key={letra}
                  type="button"
                  disabled={bloqueado || encerrado || jaRevelada || jaErrada}
                  onClick={() => clicarLetra(letra)}
                  className={`aspect-square rounded-lg font-semibold text-xs sm:text-sm border transition-colors
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
          <p className="text-[11px] text-center text-creme/40">
            Use o teclado para clicar as letras mais rapido, ou digite a palavra completa acima.
          </p>
        </>
      )}
    </div>
  );
}
