import { useState } from "react";
import { PremioOuModificador } from "../types";
import { descreverPremio } from "../game/premios";

interface CoinChoiceProps {
  ouro: PremioOuModificador;
  prata: PremioOuModificador;
  onEscolher: (moeda: "ouro" | "prata") => void;
  onContinuar: () => void;
}

/** Painel de escolha da moeda de ouro ou prata apos vencer um duelo. */
export function CoinChoice({ ouro, prata, onEscolher, onContinuar }: CoinChoiceProps) {
  const [escolhida, setEscolhida] = useState<"ouro" | "prata" | null>(null);

  function escolher(moeda: "ouro" | "prata") {
    if (escolhida) return;
    setEscolhida(moeda);
    onEscolher(moeda);
  }

  const resultados: { moeda: "ouro" | "prata"; premio: PremioOuModificador }[] = [
    { moeda: "ouro", premio: ouro },
    { moeda: "prata", premio: prata },
  ];

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h3 className="titulo-jogo text-2xl sm:text-3xl text-ouro-400">Voce venceu o duelo!</h3>
      <p className="text-creme/70 max-w-md">
        Escolha a moeda do adversario derrotado: ouro ou prata. Uma delas esconde o proximo
        premio do seu caixa.
      </p>

      <div className="flex gap-6">
        {resultados.map(({ moeda }) => (
          <button
            key={moeda}
            onClick={() => escolher(moeda)}
            disabled={!!escolhida}
            className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full font-display text-lg transition-transform
              ${moeda === "ouro" ? "bg-gradient-to-br from-ouro-400 to-ouro-600" : "bg-gradient-to-br from-slate-200 to-slate-400"}
              text-palco-950 shadow-lg
              ${!escolhida ? "hover:scale-105" : ""}
              ${escolhida && escolhida !== moeda ? "opacity-50" : ""}
              disabled:cursor-not-allowed`}
          >
            {moeda === "ouro" ? "OURO" : "PRATA"}
          </button>
        ))}
      </div>

      {escolhida && (
        <div className="mt-2 flex flex-col items-center gap-4 animate-[fadeIn_0.3s_ease] w-full">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            {resultados.map(({ moeda, premio }) => (
              <div
                key={moeda}
                className={`px-5 py-4 rounded-xl border min-w-[180px]
                  ${moeda === escolhida ? "border-acerto-500 bg-acerto-500/10" : "border-palco-700 bg-palco-800 opacity-70"}`}
              >
                <p className="text-xs uppercase tracking-wide text-creme/50 mb-1">
                  Moeda de {moeda} {moeda === escolhida ? "(escolhida)" : "(nao escolhida)"}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    moeda === escolhida ? "text-acerto-400" : "text-creme/60"
                  }`}
                >
                  {descreverPremio(premio)}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={onContinuar}
            className="px-6 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors"
          >
            Proximo adversario
          </button>
        </div>
      )}
    </div>
  );
}
