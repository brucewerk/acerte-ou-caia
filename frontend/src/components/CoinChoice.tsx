import { useState } from "react";
import { PremioOuModificador } from "../types";
import { descreverPremio, pontuarPremio } from "../game/premios";

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

  const premioEscolhido = escolhida === "ouro" ? ouro : escolhida === "prata" ? prata : null;
  const premioDescartado = escolhida === "ouro" ? prata : escolhida === "prata" ? ouro : null;

  let veredito: { texto: string; boa: boolean } | null = null;
  if (premioEscolhido && premioDescartado) {
    const pontosEscolhido = pontuarPremio(premioEscolhido);
    const pontosDescartado = pontuarPremio(premioDescartado);
    if (pontosEscolhido > pontosDescartado) {
      veredito = { texto: "Boa escolha! Essa moeda era a melhor das duas.", boa: true };
    } else if (pontosEscolhido < pontosDescartado) {
      veredito = { texto: "Que pena — a outra moeda era melhor dessa vez.", boa: false };
    } else {
      veredito = { texto: "Empate tecnico: as duas fichas eram parecidas.", boa: true };
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6 text-center">
      <h3 className="titulo-jogo text-xl sm:text-3xl text-ouro-400">Voce venceu o duelo!</h3>
      <p className="text-creme/70 max-w-md text-sm sm:text-base">
        Escolha a moeda do adversario derrotado: ouro ou prata. Uma delas esconde o proximo
        premio do seu caixa.
      </p>

      <div className="flex gap-5 sm:gap-6">
        {resultados.map(({ moeda }) => (
          <button
            key={moeda}
            onClick={() => escolher(moeda)}
            disabled={!!escolhida}
            className={`h-20 w-20 sm:h-28 sm:w-28 rounded-full font-display text-base sm:text-lg transition-transform
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
        <div className="mt-1 flex flex-col items-center gap-3 sm:gap-4 animate-fadeIn w-full">
          {veredito && (
            <p
              className={`text-sm sm:text-base font-semibold px-4 py-1.5 rounded-full border ${
                veredito.boa ? "border-acerto-500 text-acerto-400 bg-acerto-500/10" : "border-queda-500 text-queda-500 bg-queda-500/10"
              }`}
            >
              {veredito.texto}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center">
            {resultados.map(({ moeda, premio }) => (
              <div
                key={moeda}
                className={`px-4 sm:px-5 py-3 sm:py-4 rounded-xl border min-w-[160px] sm:min-w-[180px]
                  ${moeda === escolhida ? "border-acerto-500 bg-acerto-500/10" : "border-palco-700 bg-palco-800 opacity-70"}`}
              >
                <p className="text-[11px] sm:text-xs uppercase tracking-wide text-creme/50 mb-1">
                  Moeda de {moeda} {moeda === escolhida ? "(escolhida)" : "(nao escolhida)"}
                </p>
                <p
                  className={`text-base sm:text-lg font-semibold ${
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
