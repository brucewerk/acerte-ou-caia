interface GrandeDecisaoProps {
  premioAtual: number;
  onParar: () => void;
  onArriscar: () => void;
}

/** Tela da Grande Decisao: parar com metade do premio ou arriscar no desafio final. */
export function GrandeDecisao({ premioAtual, onParar, onArriscar }: GrandeDecisaoProps) {
  const metade = premioAtual / 2;

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-lg mx-auto">
      <h2 className="titulo-jogo text-3xl text-ouro-400">Voce venceu os 10 duelos!</h2>
      <p className="text-creme/70">
        Seu premio acumulado e{" "}
        <strong className="text-creme">
          {premioAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </strong>
        . Agora escolha: parar aqui e levar metade do premio para casa, ou arriscar tudo no
        desafio final de 10 perguntas em 2 minutos para dobrar o valor.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={onParar}
          className="flex-1 px-6 py-4 rounded-xl bg-palco-800 border border-palco-700 hover:border-acerto-500 transition-colors"
        >
          <span className="block text-sm text-creme/60">Parar e levar</span>
          <span className="block titulo-jogo text-xl text-acerto-400">
            {metade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </button>
        <button
          onClick={onArriscar}
          className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-br from-queda-500 to-queda-600 hover:opacity-90 transition-opacity"
        >
          <span className="block text-sm text-creme/80">Arriscar tudo e dobrar para</span>
          <span className="block titulo-jogo text-xl">
            {(premioAtual * 2).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </button>
      </div>
    </div>
  );
}
