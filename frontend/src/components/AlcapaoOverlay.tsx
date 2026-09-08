interface AlcapaoOverlayProps {
  visivel: boolean;
  quemCaiu: "jogador" | "adversario";
  nomeAdversario?: string;
}

/** Efeito visual de queda no alcapao, usado ao errar ou estourar o tempo. */
export function AlcapaoOverlay({ visivel, quemCaiu, nomeAdversario }: AlcapaoOverlayProps) {
  if (!visivel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-palco-950/90 animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <div className="h-28 w-28 rounded-full bg-queda-500 animate-cair flex items-center justify-center text-4xl">
          {quemCaiu === "jogador" ? "😮" : "😵"}
        </div>
        <p className="titulo-jogo text-3xl text-queda-500 text-center">
          {quemCaiu === "jogador" ? "VOCE CAIU!" : `${nomeAdversario ?? "ADVERSARIO"} CAIU!`}
        </p>
      </div>
    </div>
  );
}
