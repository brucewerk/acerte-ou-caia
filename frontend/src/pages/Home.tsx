import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PalcoAmbiente } from "../components/PalcoAmbiente";

const DESTAQUES = [
  { emoji: "🎤", texto: "Responda por voz" },
  { emoji: "🧠", texto: "3 modos de jogo" },
  { emoji: "🏆", texto: "Ranking dos maiorais" },
];

export default function Home() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col relative">
      <PalcoAmbiente />

      <header className="px-6 py-4 flex items-center justify-end gap-4 text-sm">
        {usuario ? (
          <>
            <Link to="/perfil" className="text-creme/70 hover:text-ouro-400 transition-colors">
              Ola, {usuario.nomeJogador}
            </Link>
            <button onClick={logout} className="text-creme/50 hover:text-queda-500 transition-colors">
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-creme/70 hover:text-ouro-400 transition-colors">
              Entrar
            </Link>
            <Link to="/registrar" className="text-creme/70 hover:text-ouro-400 transition-colors">
              Criar conta
            </Link>
          </>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8">
        <div className="animate-entrada">
          <p className="text-ouro-400 uppercase tracking-widest text-xs mb-2">by BruCe</p>
          <h1 className="titulo-jogo text-5xl sm:text-7xl leading-none drop-shadow-[0_0_35px_rgba(242,183,5,0.35)]">
            ACERTE <span className="text-queda-500">ou</span>{" "}
            <span
              className="bg-clip-text text-transparent bg-[length:200%_100%] animate-brilho"
              style={{ backgroundImage: "linear-gradient(90deg, #C99A03, #F5CB4E, #FFF3C4, #F5CB4E, #C99A03)" }}
            >
              CAIA
            </span>
          </h1>
        </div>

        <p className="max-w-xl text-creme/70 text-lg animate-entrada" style={{ animationDelay: "80ms" }}>
          Voce e o Lider do palco. Escolha seus adversarios, sobreviva ao alcapao e acumule
          premios de ate <span className="text-ouro-400 font-semibold">R$ 300.000</span> — se
          tiver coragem de arriscar tudo no desafio final.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 animate-entrada" style={{ animationDelay: "120ms" }}>
          {DESTAQUES.map((d) => (
            <span
              key={d.texto}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-creme/70 bg-palco-800/80 border border-palco-700 rounded-full px-3 py-1.5"
            >
              <span>{d.emoji}</span>
              {d.texto}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-entrada" style={{ animationDelay: "160ms" }}>
          <Link
            to="/jogar"
            className="px-8 py-4 rounded-xl bg-ouro-500 text-palco-950 font-semibold text-lg hover:bg-ouro-400 hover:scale-[1.03] transition-all shadow-holofote"
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
    </div>
  );
}
