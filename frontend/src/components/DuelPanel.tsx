import { Pergunta } from "../types";
import { Timer } from "./Timer";

interface DuelPanelProps {
  pergunta: Pergunta;
  perguntaChave: string;
  onResponder: (indice: number) => void;
  onEsgotarTempo: () => void;
  podeRepassar: boolean;
  onRepassar: () => void;
  bloqueado: boolean;
  opcaoSelecionada: number | null;
  mostrarCorreta: boolean;
}

/** Painel do duelo atual: pergunta, 4 opcoes, relogio de 30s e botao de repasse. */
export function DuelPanel({
  pergunta,
  perguntaChave,
  onResponder,
  onEsgotarTempo,
  podeRepassar,
  onRepassar,
  bloqueado,
  opcaoSelecionada,
  mostrarCorreta,
}: DuelPanelProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <Timer duracaoMs={30000} ativo={!bloqueado} onEsgotar={onEsgotarTempo} chave={perguntaChave} />

      <div className="bg-palco-800 border border-palco-700 rounded-2xl p-6 sm:p-8 text-center">
        <span className="text-xs uppercase tracking-wide text-ouro-400/80">{pergunta.categoria}</span>
        <h2 className="titulo-jogo text-xl sm:text-2xl mt-2 leading-snug">{pergunta.pergunta}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pergunta.opcoes.map((opcao, i) => {
          const ehCorreta = mostrarCorreta && i === pergunta.respostaCorreta;
          const ehErrada = mostrarCorreta && i === opcaoSelecionada && i !== pergunta.respostaCorreta;
          return (
            <button
              key={i}
              disabled={bloqueado}
              onClick={() => onResponder(i)}
              className={`text-left px-5 py-4 rounded-xl border transition-colors font-medium
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

      {podeRepassar && !bloqueado && (
        <button
          onClick={onRepassar}
          className="self-center text-sm px-4 py-2 rounded-lg border border-ouro-500 text-ouro-400 hover:bg-ouro-500/10 transition-colors"
        >
          Usar vida para repassar a pergunta ao adversario
        </button>
      )}
    </div>
  );
}
