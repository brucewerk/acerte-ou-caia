import { Adversario } from "../types";

interface PalcoProps {
  adversarios: Adversario[];
  adversarioAtualEstacao: number | null;
  vidas: number;
  selecionavel?: boolean;
  onSelecionar?: (estacao: number) => void;
}

/** Representa visualmente o palco: as 10 estacoes adversarias ao redor do Lider. */
export function Palco({
  adversarios,
  adversarioAtualEstacao,
  vidas,
  selecionavel = false,
  onSelecionar,
}: PalcoProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${
              i < vidas ? "bg-ouro-500 shadow-[0_0_10px_2px_rgba(242,183,5,0.6)]" : "bg-palco-700"
            }`}
            title={i < vidas ? "Vida disponivel" : "Vida perdida"}
          />
        ))}
        <span className="text-xs text-creme/60 ml-2">vidas do Lider</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
        {adversarios.map((a, i) => {
          const atual = a.estacao === adversarioAtualEstacao;
          const clicavel = selecionavel && !a.derrotado && onSelecionar;
          return (
            <button
              key={a.estacao}
              type="button"
              disabled={!clicavel}
              onClick={() => clicavel && onSelecionar!(a.estacao)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all animate-entrada opacity-0
                ${a.derrotado ? "bg-palco-800/40 border-palco-700 opacity-40" : "bg-palco-800 border-palco-700"}
                ${atual && !a.derrotado ? "ring-2 ring-ouro-500 animate-pulsarOuro" : ""}
                ${clicavel ? "cursor-pointer hover:border-ouro-500 hover:bg-palco-700 hover:-translate-y-1" : "cursor-default"}
              `}
              title={a.derrotado ? `${a.nome} caiu` : `${a.nome} (${a.frase})`}
            >
              <span className={`text-lg sm:text-2xl ${!a.derrotado ? "animate-quicar" : ""}`}>
                {a.derrotado ? "😵" : a.emoji}
              </span>
              <span className="text-[9px] sm:text-[11px] text-creme/50">#{a.estacao}</span>
              <span className="text-[9px] sm:text-[11px] font-semibold leading-tight text-center px-1">
                {a.derrotado ? "Caiu" : a.nome}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
