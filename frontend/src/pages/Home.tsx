import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8">
      <div>
        <p className="text-ouro-400 uppercase tracking-widest text-xs mb-2">by BruCe</p>
        <h1 className="titulo-jogo text-5xl sm:text-7xl leading-none">
          ACERTE <span className="text-queda-500">ou</span>{" "}
          <span className="text-ouro-400">CAIA</span>
        </h1>
      </div>

      <p className="max-w-xl text-creme/70 text-lg">
        Voce e o Lider do palco. Encare 10 adversarios em duelos de perguntas e respostas,
        sobreviva ao alcapao e acumule premios de ate{" "}
        <span className="text-ouro-400 font-semibold">R$ 300.000</span> — se tiver coragem de
        arriscar tudo no desafio final.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/jogar"
          className="px-8 py-4 rounded-xl bg-ouro-500 text-palco-950 font-semibold text-lg hover:bg-ouro-400 transition-colors shadow-holofote"
        >
          Jogar agora
        </Link>
        <Link
          to="/ranking"
          className="px-8 py-4 rounded-xl border border-palco-700 hover:border-ouro-500 transition-colors text-lg"
        >
          Ver ranking
        </Link>
      </div>

      <Link to="/admin" className="text-xs text-creme/40 hover:text-creme/70 transition-colors">
        Acesso do administrador
      </Link>
    </div>
  );
}
