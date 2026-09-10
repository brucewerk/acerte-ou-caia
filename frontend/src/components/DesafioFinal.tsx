import { useEffect, useRef, useState } from "react";
import { Pergunta } from "../types";
import { buscarPerguntas } from "../api/game";
import { sons } from "../game/sons";

interface DesafioFinalProps {
  onFinalizar: (sucesso: boolean) => void;
  idsExcluidos?: string[];
}

const TOTAL_PERGUNTAS = 10;
const LIMITE_MS = 120000;

/** Desafio final: 10 perguntas em 2 minutos. Uma unica resposta errada encerra tudo. */
export function DesafioFinal({ onFinalizar, idsExcluidos = [] }: DesafioFinalProps) {
  const [perguntas, setPerguntas] = useState<Pergunta[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [tempoRestanteMs, setTempoRestanteMs] = useState(LIMITE_MS);
  const [encerrado, setEncerrado] = useState(false);
  const inicioRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    buscarPerguntas(TOTAL_PERGUNTAS, undefined, idsExcluidos.join(","))
      .then(setPerguntas)
      .catch(() => setPerguntas([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!perguntas || encerrado) return;
    inicioRef.current = performance.now();

    function tick(agora: number) {
      const decorrido = agora - inicioRef.current;
      const restante = Math.max(0, LIMITE_MS - decorrido);
      setTempoRestanteMs(restante);
      if (restante <= 0) {
        finalizar(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntas, encerrado]);

  function finalizar(sucesso: boolean) {
    if (encerrado) return;
    setEncerrado(true);
    cancelAnimationFrame(frameRef.current);
    if (sucesso) sons.vitoria();
    else sons.queda();
    onFinalizar(sucesso);
  }

  function responder(i: number) {
    if (!perguntas || encerrado || selecionada !== null) return;
    const correta = perguntas[indice].respostaCorreta === i;
    setSelecionada(i);
    setMostrarResultado(true);
    correta ? sons.acerto() : sons.erro();

    setTimeout(() => {
      if (!correta) {
        finalizar(false);
        return;
      }
      if (indice + 1 >= TOTAL_PERGUNTAS) {
        finalizar(true);
        return;
      }
      setIndice((v) => v + 1);
      setSelecionada(null);
      setMostrarResultado(false);
    }, 700);
  }

  if (!perguntas) {
    return <p className="text-center text-creme/60">Preparando o desafio final...</p>;
  }

  const segundos = Math.ceil(tempoRestanteMs / 1000);
  const perguntaAtual = perguntas[indice];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 sm:gap-6 animate-entrada">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-creme/60">
          Pergunta {indice + 1} de {TOTAL_PERGUNTAS}
        </span>
        <span
          className={`titulo-jogo text-xl sm:text-2xl ${segundos <= 20 ? "text-queda-500" : "text-ouro-400"}`}
        >
          {segundos}s
        </span>
      </div>

      <div className="w-full h-2.5 sm:h-3 rounded-full bg-palco-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-acerto-500 via-ouro-500 to-queda-500"
          style={{ width: `${(tempoRestanteMs / LIMITE_MS) * 100}%` }}
        />
      </div>

      {perguntaAtual && (
        <>
          <div className="bg-palco-800 border border-palco-700 rounded-2xl p-4 sm:p-8 text-center">
            <h2 className="titulo-jogo text-lg sm:text-2xl leading-snug">{perguntaAtual.pergunta}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {perguntaAtual.opcoes.map((opcao, i) => {
              const ehCorreta = mostrarResultado && i === perguntaAtual.respostaCorreta;
              const ehErrada = mostrarResultado && i === selecionada && i !== perguntaAtual.respostaCorreta;
              return (
                <button
                  key={i}
                  disabled={selecionada !== null}
                  onClick={() => responder(i)}
                  className={`text-left px-4 sm:px-5 py-3 sm:py-4 rounded-xl border transition-colors font-medium text-sm sm:text-base
                    ${ehCorreta ? "bg-acerto-500/20 border-acerto-500 text-acerto-400" : ""}
                    ${ehErrada ? "bg-queda-500/20 border-queda-500 text-queda-500" : ""}
                    ${!ehCorreta && !ehErrada ? "bg-palco-800 border-palco-700 hover:border-ouro-500 hover:bg-palco-700" : ""}
                    disabled:cursor-not-allowed`}
                >
                  {opcao}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
