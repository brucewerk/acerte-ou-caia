import { useEffect, useRef } from "react";

interface TimerProps {
  duracaoMs: number;
  ativo: boolean;
  onEsgotar: () => void;
  chave: string | number; // muda a cada pergunta para reiniciar o timer
}

/** Barra de relogio regressiva usada nos duelos (limite de 30s do programa). */
export function Timer({ duracaoMs, ativo, onEsgotar, chave }: TimerProps) {
  const barraRef = useRef<HTMLDivElement>(null);
  const inicioRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const esgotouRef = useRef(false);

  useEffect(() => {
    esgotouRef.current = false;
    inicioRef.current = performance.now();

    function tick(agora: number) {
      const decorrido = agora - inicioRef.current;
      const restante = Math.max(0, 1 - decorrido / duracaoMs);

      if (barraRef.current) {
        barraRef.current.style.width = `${restante * 100}%`;
      }

      if (restante <= 0 && !esgotouRef.current) {
        esgotouRef.current = true;
        onEsgotar();
        return;
      }

      if (ativo && restante > 0) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    if (ativo) {
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, ativo]);

  return (
    <div className="w-full h-3 rounded-full bg-palco-700 overflow-hidden" role="timer" aria-label="Tempo restante">
      <div
        ref={barraRef}
        className="h-full rounded-full bg-gradient-to-r from-acerto-500 via-ouro-500 to-queda-500 transition-[width] duration-100 linear"
        style={{ width: "100%" }}
      />
    </div>
  );
}
