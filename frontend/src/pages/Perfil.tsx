import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { mensagemDeErro } from "../utils/erro";

export default function Perfil() {
  const { usuario, atualizarPerfil, logout, carregando: carregandoAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(usuario?.email ?? "");
  const [nomeJogador, setNomeJogador] = useState(usuario?.nomeJogador ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!carregandoAuth && !usuario) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-creme/70">Voce precisa entrar para ver seu perfil.</p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (novaSenha && novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha && !senhaAtual) {
      setErro("Informe sua senha atual para definir uma nova senha.");
      return;
    }

    setCarregando(true);
    try {
      await atualizarPerfil({
        email: email.trim(),
        nomeJogador: nomeJogador.trim(),
        senhaAtual: senhaAtual || undefined,
        novaSenha: novaSenha || undefined,
      });
      setSenhaAtual("");
      setNovaSenha("");
      setSucesso("Perfil atualizado com sucesso!");
    } catch (err) {
      setErro(mensagemDeErro(err, "Nao foi possivel atualizar seu perfil."));
    } finally {
      setCarregando(false);
    }
  }

  function aoSair() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 py-10 gap-6">
      <Link to="/" className="titulo-jogo text-lg text-ouro-400 self-start">
        ACERTE <span className="text-creme">ou</span> CAIA
      </Link>

      <form
        onSubmit={aoSalvar}
        className="w-full max-w-sm bg-palco-800 border border-palco-700 rounded-2xl p-6 flex flex-col gap-4 animate-entrada"
      >
        <h1 className="titulo-jogo text-2xl text-ouro-400 text-center">Meu perfil</h1>

        {erro && (
          <p className="text-sm bg-queda-500/10 border border-queda-500 text-queda-500 rounded-lg px-3 py-2">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="text-sm bg-acerto-500/10 border border-acerto-500 text-acerto-400 rounded-lg px-3 py-2">
            {sucesso}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-creme/60">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 focus:border-ouro-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-creme/60">Nome de jogador</label>
          <input
            value={nomeJogador}
            onChange={(e) => setNomeJogador(e.target.value)}
            maxLength={30}
            className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 focus:border-ouro-500 outline-none"
          />
        </div>

        <hr className="border-palco-700 my-1" />
        <p className="text-xs text-creme/50">Deixe em branco se nao quiser trocar de senha.</p>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-creme/60">Senha atual</label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 focus:border-ouro-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-creme/60">Nova senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 focus:border-ouro-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="mt-2 px-6 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
        >
          {carregando ? "Salvando..." : "Salvar alteracoes"}
        </button>

        <button
          type="button"
          onClick={aoSair}
          className="px-6 py-3 rounded-lg border border-queda-500 text-queda-500 hover:bg-queda-500/10 transition-colors"
        >
          Sair da conta
        </button>
      </form>
    </div>
  );
}
