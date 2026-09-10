import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { mensagemDeErro } from "../utils/erro";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(identificador.trim(), senha);
      navigate("/");
    } catch (err) {
      setErro(mensagemDeErro(err, "Nao foi possivel entrar. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 gap-6">
      <Link to="/" className="titulo-jogo text-lg text-ouro-400">
        ACERTE <span className="text-creme">ou</span> CAIA
      </Link>

      <form
        onSubmit={aoEnviar}
        className="w-full max-w-sm bg-palco-800 border border-palco-700 rounded-2xl p-6 flex flex-col gap-4 animate-entrada"
      >
        <h1 className="titulo-jogo text-2xl text-ouro-400 text-center">Entrar</h1>

        {erro && (
          <p className="text-sm bg-queda-500/10 border border-queda-500 text-queda-500 rounded-lg px-3 py-2">
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-creme/60">Email ou nome de jogador</label>
          <input
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 focus:border-ouro-500 outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-creme/60">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 focus:border-ouro-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="mt-2 px-6 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-sm text-center text-creme/60">
          Nao tem conta?{" "}
          <Link to="/registrar" className="text-ouro-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
        <Link to="/jogar" className="text-xs text-center text-creme/40 hover:text-creme/70">
          Prefiro jogar como visitante
        </Link>
      </form>
    </div>
  );
}
