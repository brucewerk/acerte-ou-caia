import { useMemo } from "react";

interface ConfeteProps {
  ativo: boolean;
  quantidade?: number;
}

const CORES = ["#F2B705", "#E63946", "#2EC4B6", "#F4F1EA", "#F5CB4E"];

/** Chuva de confete em CSS puro, usada para celebrar vitorias marcantes. */
export function Confete({ ativo, quantidade = 40 }: ConfeteProps) {
  const pecas = useMemo(
    () =>
      Array.from({ length: quantidade }, (_, i) => ({
        id: i,
        esquerda: `${Math.random() * 100}%`,
        atraso: `${Math.random() * 0.6}s`,
        duracao: `${1.8 + Math.random() * 1.4}s`,
        deriva: `${(Math.random() - 0.5) * 160}px`,
        cor: CORES[i % CORES.length],
        tamanho: 6 + Math.random() * 6,
        arredondado: Math.random() > 0.5,
      })),
    [quantidade]
  );

  if (!ativo) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {pecas.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confeteCair"
          style={
            {
              left: p.esquerda,
              width: p.tamanho,
              height: p.tamanho * 0.4,
              backgroundColor: p.cor,
              borderRadius: p.arredondado ? "9999px" : "2px",
              animationDelay: p.atraso,
              animationDuration: p.duracao,
              "--deriva": p.deriva,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
