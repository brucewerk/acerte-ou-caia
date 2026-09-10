import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiAdmin } from "../api/client";
import { Categoria, Dificuldade, Pergunta } from "../types";

const CATEGORIAS: Categoria[] = [
  "geografia",
  "historia",
  "ciencias",
  "esportes",
  "entretenimento",
  "cultura-geral",
  "artes",
  "atualidades",
];
const DIFICULDADES: Dificuldade[] = ["facil", "medio", "dificil"];

const FORM_VAZIO = {
  pergunta: "",
  opcoes: ["", "", "", ""],
  respostaCorreta: 0,
  categoria: "cultura-geral" as Categoria,
  dificuldade: "medio" as Dificuldade,
};

export default function Admin() {
  const [chave, setChave] = useState(() => localStorage.getItem("aoc_admin_key") || "");
  const [autenticado, setAutenticado] = useState(false);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [stats, setStats] = useState<{ total: number; porCategoria: { _id: string; total: number }[] } | null>(
    null
  );
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregarTudo(chaveAtual: string) {
    setCarregando(true);
    setErro(null);
    try {
      const client = apiAdmin(chaveAtual);
      const [respPerguntas, respStats] = await Promise.all([
        client.get<Pergunta[]>("/questions"),
        client.get("/questions/stats"),
      ]);
      setPerguntas(respPerguntas.data);
      setStats(respStats.data);
      setAutenticado(true);
      localStorage.setItem("aoc_admin_key", chaveAtual);
    } catch {
      setErro("Chave de administrador invalida ou API indisponivel.");
      setAutenticado(false);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (chave) carregarTudo(chave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function criarPergunta() {
    if (!form.pergunta.trim() || form.opcoes.some((o) => !o.trim())) {
      setErro("Preencha a pergunta e as 4 opcoes antes de salvar.");
      return;
    }
    try {
      const client = apiAdmin(chave);
      await client.post("/questions", { ...form, ativa: true });
      setForm(FORM_VAZIO);
      carregarTudo(chave);
    } catch {
      setErro("Nao foi possivel salvar a pergunta.");
    }
  }

  async function removerPergunta(id: string) {
    try {
      const client = apiAdmin(chave);
      await client.delete(`/questions/${id}`);
      carregarTudo(chave);
    } catch {
      setErro("Nao foi possivel remover a pergunta.");
    }
  }

  async function alternarAtiva(p: Pergunta) {
    try {
      const client = apiAdmin(chave);
      await client.put(`/questions/${p._id}`, { ativa: !p.ativa });
      carregarTudo(chave);
    } catch {
      setErro("Nao foi possivel atualizar a pergunta.");
    }
  }

  if (!autenticado) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="titulo-jogo text-3xl text-ouro-400">Painel do administrador</h1>
        <input
          type="password"
          value={chave}
          onChange={(e) => setChave(e.target.value)}
          placeholder="Chave de administrador (ADMIN_KEY)"
          className="w-full max-w-sm px-4 py-3 rounded-lg bg-palco-800 border border-palco-700 focus:border-ouro-500 outline-none text-center"
        />
        {erro && <p className="text-queda-500 text-sm">{erro}</p>}
        <button
          onClick={() => carregarTudo(chave)}
          disabled={!chave || carregando}
          className="px-6 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        <Link to="/" className="text-xs text-creme/40 hover:text-creme/70">
          Voltar ao inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-6 py-10 max-w-4xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="titulo-jogo text-3xl text-ouro-400">Painel do administrador</h1>
        <Link to="/" className="text-sm text-creme/50 hover:text-creme">
          Voltar ao inicio
        </Link>
      </div>

      {erro && <p className="text-queda-500 text-sm">{erro}</p>}

      {stats && (
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 rounded-lg bg-palco-800 border border-palco-700 text-sm">
            Total: <strong className="text-ouro-400">{stats.total}</strong>
          </span>
          {stats.porCategoria.map((c) => (
            <span key={c._id} className="px-4 py-2 rounded-lg bg-palco-800 border border-palco-700 text-sm">
              {c._id}: <strong>{c.total}</strong>
            </span>
          ))}
        </div>
      )}

      <section className="bg-palco-800 border border-palco-700 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ouro-400">Nova pergunta</h2>
        <textarea
          value={form.pergunta}
          onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
          placeholder="Texto da pergunta"
          className="px-4 py-3 rounded-lg bg-palco-900 border border-palco-700 outline-none focus:border-ouro-500"
          rows={2}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {form.opcoes.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correta"
                checked={form.respostaCorreta === i}
                onChange={() => setForm({ ...form, respostaCorreta: i })}
              />
              <input
                value={o}
                onChange={(e) => {
                  const opcoes = [...form.opcoes];
                  opcoes[i] = e.target.value;
                  setForm({ ...form, opcoes });
                }}
                placeholder={`Opcao ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg bg-palco-900 border border-palco-700 outline-none focus:border-ouro-500"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria })}
            className="px-3 py-2 rounded-lg bg-palco-900 border border-palco-700"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={form.dificuldade}
            onChange={(e) => setForm({ ...form, dificuldade: e.target.value as Dificuldade })}
            className="px-3 py-2 rounded-lg bg-palco-900 border border-palco-700"
          >
            {DIFICULDADES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button
            onClick={criarPergunta}
            className="ml-auto px-6 py-2 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors"
          >
            Salvar pergunta
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ouro-400">
          Banco de perguntas ({perguntas.length})
        </h2>
        <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
          {perguntas.map((p) => (
            <div
              key={p._id}
              className={`flex items-start justify-between gap-4 bg-palco-800 border rounded-xl px-4 py-3 ${
                p.ativa ? "border-palco-700" : "border-queda-500/40 opacity-60"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{p.pergunta}</p>
                <p className="text-xs text-creme/50 mt-1">
                  {p.categoria} · {p.dificuldade} · correta: {p.opcoes[p.respostaCorreta]}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => alternarAtiva(p)}
                  className="text-xs px-3 py-1 rounded-lg border border-palco-700 hover:border-ouro-500"
                >
                  {p.ativa ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => removerPergunta(p._id)}
                  className="text-xs px-3 py-1 rounded-lg border border-queda-500 text-queda-500 hover:bg-queda-500/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
