interface AlcapaoOverlayProps {
  visivel: boolean;
  quemCaiu: "jogador" | "adversario";
  nomeAdversario?: string;
}

/** Efeito visual de queda no alcapao, usado ao errar ou estourar o tempo. */
export function AlcapaoOverlay({ visivel, quemCaiu, nomeAdversario }: AlcapaoOverlayProps) {
  if (!visivel) return null;

  const corTexto = quemCaiu === "jogador" ? "text-queda-500" : "text-acerto-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-palco-950/90 animate-fadeIn overflow-hidden">
      {/* Rachaduras de luz saindo do centro, sugerindo o alcapao se abrindo */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(230,57,70,0.35) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-4 animate-tremor">
        <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-queda-500 animate-cair flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_60px_10px_rgba(230,57,70,0.5)]">
          {quemCaiu === "jogador" ? "😮" : "😵"}
        </div>
        <p className={`titulo-jogo text-2xl sm:text-3xl text-center ${corTexto}`}>
          {quemCaiu === "jogador" ? "VOCE CAIU!" : `${nomeAdversario ?? "ADVERSARIO"} CAIU!`}
        </p>
      </div>
    </div>
  );
}
