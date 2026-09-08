import { useEffect, useRef, useState } from "react";
import { Pergunta } from "../types";
import { buscarPerguntas } from "../api/game";

interface DesafioFinalProps {
  onFinalizar: (sucesso: boolean) => void;
}

const TOTAL_PERGUNTAS = 10;
const LIMITE_MS = 120000;

/** Desafio final: 10 perguntas em 2 minutos. Uma unica resposta errada encerra tudo. */
export function DesafioFinal({ onFinalizar }: DesafioFinalProps) {
  const [perguntas, setPerguntas] = useState<Pergunta[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [tempoRestanteMs, setTempoRestanteMs] = useState(LIMITE_MS);
  const [encerrado, setEncerrado] = useState(false);
  const inicioRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    buscarPerguntas(TOTAL_PERGUNTAS).then(setPerguntas).catch(() => setPerguntas([]));
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
    onFinalizar(sucesso);
  }

  function responder(i: number) {
    if (!perguntas || encerrado) return;
    const correta = perguntas[indice].respostaCorreta === i;
    if (!correta) {
      finalizar(false);
      return;
    }
    if (indice + 1 >= TOTAL_PERGUNTAS) {
      finalizar(true);
      return;
    }
    setIndice((v) => v + 1);
  }

  if (!perguntas) {
    return <p className="text-center text-creme/60">Preparando o desafio final...</p>;
  }

  const segundos = Math.ceil(tempoRestanteMs / 1000);
  const perguntaAtual = perguntas[indice];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-creme/60">
          Pergunta {indice + 1} de {TOTAL_PERGUNTAS}
        </span>
        <span
          className={`titulo-jogo text-2xl ${segundos <= 20 ? "text-queda-500" : "text-ouro-400"}`}
        >
          {segundos}s
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-palco-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-acerto-500 via-ouro-500 to-queda-500"
          style={{ width: `${(tempoRestanteMs / LIMITE_MS) * 100}%` }}
        />
      </div>

      {perguntaAtual && (
        <>
          <div className="bg-palco-800 border border-palco-700 rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="titulo-jogo text-xl sm:text-2xl leading-snug">{perguntaAtual.pergunta}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {perguntaAtual.opcoes.map((opcao, i) => (
              <button
                key={i}
                onClick={() => responder(i)}
                className="text-left px-5 py-4 rounded-xl border border-palco-700 bg-palco-800 hover:border-ouro-500 hover:bg-palco-700 transition-colors font-medium"
              >
                {opcao}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
