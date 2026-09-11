import { FichaPainel } from "../game/premios";

interface PainelPremiosProps {
  fichas: FichaPainel[];
  aberto: boolean;
  onFechar: () => void;
}

/** Painel (modal) mostrando quais fichas ainda podem sair nas moedas dos proximos duelos.
 * Fichas ja reveladas desaparecem da lista (nao aparecem jamais novamente na partida). */
export function PainelPremios({ fichas, aberto, onFechar }: PainelPremiosProps) {
  if (!aberto) return null;

  const disponiveis = fichas.filter((f) => !f.revelada);
  const totalEmDinheiro = disponiveis
    .filter((f) => f.premio.tipo === "valor")
    .reduce((soma, f) => soma + (f.premio.tipo === "valor" ? f.premio.valor : 0), 0);

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

        <div className="bg-palco-900 border border-palco-700 rounded-xl px-4 py-3 text-center">
          <p className="text-[11px] text-creme/50 uppercase tracking-wide">Ainda em jogo para conquistar</p>
          <p className="titulo-jogo text-xl text-acerto-400">
            {totalEmDinheiro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        <p className="text-xs text-creme/50">
          Fichas ja reveladas somem desta lista. As especiais (Vida Extra, Dividir por 2 e Perde
          Tudo) so aparecem uma vez em toda a partida.
        </p>

        {disponiveis.length === 0 ? (
          <p className="text-center text-sm text-creme/50 py-4">Todas as fichas ja foram reveladas.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {disponiveis.map((f) => (
              <div
                key={f.id}
                className={`text-center text-[11px] sm:text-xs px-2 py-2 rounded-lg border ${
                  f.premio.tipo !== "valor"
                    ? "border-ouro-500 text-ouro-400 font-semibold"
                    : "border-palco-700 text-creme/80"
                }`}
              >
                {f.rotulo}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
