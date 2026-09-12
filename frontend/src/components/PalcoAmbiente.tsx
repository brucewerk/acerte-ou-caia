/**
 * Fundo decorativo e imersivo do jogo: holofotes animados e particulas
 * douradas flutuantes, feitos 100% em CSS/SVG (sem depender de nenhuma
 * imagem externa). Fica atras do conteudo (pointer-events-none) para nao
 * atrapalhar a interacao.
 */
export function PalcoAmbiente() {
  const particulas = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    esquerda: `${(i * 37) % 100}%`,
    atraso: `${(i * 0.7) % 6}s`,
    duracao: `${5 + (i % 5)}s`,
    tamanho: 3 + (i % 4),
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Holofotes girando lentamente no fundo, como luzes de um palco de TV */}
      <div
        className="absolute -top-1/3 left-1/4 h-[60vh] w-[60vh] rounded-full opacity-20 blur-3xl animate-flutuar"
        style={{ background: "radial-gradient(circle, #F2B705 0%, transparent 70%)" }}
      />
      <div
        className="absolute -top-1/4 right-1/4 h-[50vh] w-[50vh] rounded-full opacity-10 blur-3xl animate-flutuar"
        style={{ background: "radial-gradient(circle, #E63946 0%, transparent 70%)", animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[45vh] w-[45vh] -translate-x-1/2 rounded-full opacity-10 blur-3xl animate-flutuar"
        style={{ background: "radial-gradient(circle, #2EC4B6 0%, transparent 70%)", animationDelay: "4s" }}
      />

      {/* Particulas douradas flutuando lentamente, como poeira de holofote */}
      {particulas.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-ouro-400 animate-piscar"
          style={{
            left: p.esquerda,
            top: `${(p.id * 53) % 100}%`,
            width: p.tamanho,
            height: p.tamanho,
            animationDelay: p.atraso,
            animationDuration: p.duracao,
          }}
        />
      ))}
    </div>
  );
}
