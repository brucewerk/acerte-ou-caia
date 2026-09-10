import { FichaPainel } from "../game/premios";

interface PainelPremiosProps {
  fichas: FichaPainel[];
  aberto: boolean;
  onFechar: () => void;
}

/** Painel (modal) mostrando quais fichas ainda podem sair nas moedas dos proximos duelos. */
export function PainelPremios({ fichas, aberto, onFechar }: PainelPremiosProps) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-palco-950/80 px-3 py-4 animate-fadeIn"
      onClick={onFechar}
    >
      <div
        className="w-full sm:max-w-lg max-h-[75dvh] overflow-y-auto bg-palco-800 border border-palco-700 rounded-2xl p-4 sm:p-6 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="titulo-jogo text-lg text-ouro-400">Painel de premios</h3>
          <button onClick={onFechar} className="text-creme/50 hover:text-creme text-sm px-2 py-1">
            Fechar
          </button>
        </div>
        <p className="text-xs text-creme/50">
          Fichas que ja sairam ficam apagadas. As especiais (Vida Extra, Dividir por 2 e Perde
          Tudo) so aparecem uma vez em toda a partida.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {fichas.map((f) => (
            <div
              key={f.id}
              className={`text-center text-[11px] sm:text-xs px-2 py-2 rounded-lg border transition-opacity
                ${
                  f.revelada
                    ? "border-palco-700 text-creme/25 line-through opacity-40"
                    : f.premio.tipo !== "valor"
                    ? "border-ouro-500 text-ouro-400 font-semibold"
                    : "border-palco-700 text-creme/80"
                }`}
            >
              {f.rotulo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
