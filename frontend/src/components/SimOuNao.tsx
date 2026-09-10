import { Afirmacao } from "../types";
import { Timer } from "./Timer";

interface SimOuNaoProps {
  afirmacao: Afirmacao;
  chave: string;
  onResponder: (escolhaVerdadeira: boolean) => void;
  onEsgotarTempo: () => void;
  bloqueado: boolean;
  mostrarResultado: boolean;
  escolhaFeita: boolean | null;
  mostrarTimer?: boolean;
}

/** Rodada especial "Sim ou Nao": o jogador diz se a afirmacao e verdadeira ou falsa. */
export function SimOuNao({
  afirmacao,
  chave,
  onResponder,
  onEsgotarTempo,
  bloqueado,
  mostrarResultado,
  escolhaFeita,
  mostrarTimer = true,
}: SimOuNaoProps) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 sm:gap-6">
      {mostrarTimer && (
        <Timer duracaoMs={30000} ativo={!bloqueado} onEsgotar={onEsgotarTempo} chave={chave} />
      )}

      <div className="bg-palco-800 border border-palco-700 rounded-2xl p-4 sm:p-8 text-center">
        <span className="text-xs uppercase tracking-wide text-ouro-400/80">Sim ou Nao</span>
        <h2 className="titulo-jogo text-lg sm:text-2xl mt-2 leading-snug">{afirmacao.afirmacao}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { rotulo: "VERDADEIRO", valor: true },
          { rotulo: "FALSO", valor: false },
        ].map(({ rotulo, valor }) => {
          const ehCorreta = mostrarResultado && valor === afirmacao.verdadeira;
          const ehEscolhaErrada = mostrarResultado && escolhaFeita === valor && valor !== afirmacao.verdadeira;
          return (
            <button
              key={rotulo}
              disabled={bloqueado}
              onClick={() => onResponder(valor)}
              className={`py-4 sm:py-6 rounded-xl border titulo-jogo text-base sm:text-lg transition-colors
                ${ehCorreta ? "bg-acerto-500/20 border-acerto-500 text-acerto-400" : ""}
                ${ehEscolhaErrada ? "bg-queda-500/20 border-queda-500 text-queda-500" : ""}
                ${!ehCorreta && !ehEscolhaErrada ? "bg-palco-800 border-palco-700 hover:border-ouro-500 hover:bg-palco-700" : ""}
                disabled:cursor-not-allowed`}
            >
              {rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
