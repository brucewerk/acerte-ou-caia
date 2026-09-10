import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarRanking } from "../api/game";
import { ResultadoRanking } from "../types";

export default function Ranking() {
  const [ranking, setRanking] = useState<ResultadoRanking[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarRanking()
      .then(setRanking)
      .catch(() => setErro("Nao foi possivel carregar o ranking agora."));
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 py-12 gap-8">
      <Link to="/" className="titulo-jogo text-lg text-ouro-400 self-start">
        ACERTE <span className="text-creme">ou</span> CAIA
      </Link>

      <h1 className="titulo-jogo text-4xl text-ouro-400">Top 10 Maiorais</h1>

      {erro && <p className="text-queda-500">{erro}</p>}

      {!ranking && !erro && <p className="text-creme/60 animate-pulse">Carregando ranking...</p>}

      {ranking && ranking.length === 0 && (
        <p className="text-creme/60">Ninguem venceu uma partida ainda. Seja o primeiro!</p>
      )}

      {ranking && ranking.length > 0 && (
        <div className="w-full max-w-2xl flex flex-col gap-2">
          {ranking.map((r, i) => (
            <div
              key={r._id}
              className="flex items-center justify-between bg-palco-800 border border-palco-700 rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <span className={`titulo-jogo text-xl w-8 ${i === 0 ? "text-ouro-400" : "text-creme/50"}`}>
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{r.jogador}</p>
                  <p className="text-xs text-creme/50">
                    {r.duelosVencidos} duelos vencidos
                    {r.dobrouPremio ? " · dobrou o premio no desafio final" : ""}
                  </p>
                </div>
              </div>
              <span className="titulo-jogo text-lg text-ouro-400">
                {r.premioFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/jogar"
        className="px-8 py-3 rounded-xl bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors"
      >
        Jogar e entrar para o ranking
      </Link>
    </div>
  );
}
