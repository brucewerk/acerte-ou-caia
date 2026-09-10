import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col">
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 -mt-16">
        <div className="animate-entrada">
          <p className="text-ouro-400 uppercase tracking-widest text-xs mb-2">by BruCe</p>
          <h1 className="titulo-jogo text-5xl sm:text-7xl leading-none">
            ACERTE <span className="text-queda-500">ou</span>{" "}
            <span className="text-ouro-400">CAIA</span>
          </h1>
        </div>

        <p className="max-w-xl text-creme/70 text-lg animate-entrada" style={{ animationDelay: "80ms" }}>
          Voce e o Lider do palco. Escolha seus adversarios, sobreviva ao alcapao e acumule
          premios de ate <span className="text-ouro-400 font-semibold">R$ 300.000</span> — se
          tiver coragem de arriscar tudo no desafio final.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-entrada" style={{ animationDelay: "160ms" }}>
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
    </div>
  );
}
