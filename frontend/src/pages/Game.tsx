import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useJogo } from "../game/useJogo";
import { useAuth } from "../auth/AuthContext";
import { sons } from "../game/sons";
import { Palco } from "../components/Palco";
import { DuelPanel } from "../components/DuelPanel";
import { LetrasEmbaralhadas } from "../components/LetrasEmbaralhadas";
import { SimOuNao } from "../components/SimOuNao";
import { CoinChoice } from "../components/CoinChoice";
import { AlcapaoOverlay } from "../components/AlcapaoOverlay";
import { GrandeDecisao } from "../components/GrandeDecisao";
import { DesafioFinal } from "../components/DesafioFinal";
import { PainelPremios } from "../components/PainelPremios";
import { PalcoAmbiente } from "../components/PalcoAmbiente";
import { Confete } from "../components/Confete";

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Mensagem de marco de progresso mostrada na tela de escolha do adversario. */
function mensagemDeMarco(duelosVencidos: number, totalDuelos: number): string | null {
  if (duelosVencidos === totalDuelos - 1) return "Este e o duelo final!";
  if ([2, 6, 8].includes(duelosVencidos)) {
    return `Faltam ${totalDuelos - duelosVencidos} duelos para a grande final!`;
  }
  return null;
}

export default function Game() {
  const jogo = useJogo();
  const { usuario } = useAuth();
  const [nomeInput, setNomeInput] = useState("");
  const [mudo, setMudo] = useState(sons.estaMudo());
  const [painelAberto, setPainelAberto] = useState(false);

  useEffect(() => {
    if (usuario) setNomeInput(usuario.nomeJogador);
  }, [usuario]);

  function alternarSom() {
    setMudo(sons.alternarMudo());
  }

  const marco = jogo.fase === "escolhendo" ? mensagemDeMarco(jogo.duelosVencidos, jogo.totalDuelos) : null;
  const vitoriaComPremio = jogo.fase === "fim" && !!jogo.resultadoFinal?.sucesso && jogo.resultadoFinal.premioFinal > 0;

  return (
    <div className="min-h-dvh flex flex-col relative">
      <PalcoAmbiente />
      <Confete ativo={vitoriaComPremio} />
      <AlcapaoOverlay
        visivel={jogo.queda.visivel}
        quemCaiu={jogo.queda.quemCaiu}
        nomeAdversario={jogo.adversarioAtual?.nome}
      />
      <PainelPremios fichas={jogo.fichasPainel} aberto={painelAberto} onFechar={() => setPainelAberto(false)} />

      <header className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-palco-800 shrink-0">
        <Link to="/" className="titulo-jogo text-sm sm:text-lg text-ouro-400 shrink-0">
          ACERTE <span className="text-creme">ou</span> CAIA
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          {jogo.fase !== "nome" && (
            <>
              <span className="text-creme/60 hidden sm:inline">
                Duelo {Math.min(jogo.duelosVencidos + 1, jogo.totalDuelos)}/{jogo.totalDuelos}
              </span>
              <span className="titulo-jogo text-ouro-400 text-sm sm:text-base">{formatarMoeda(jogo.premio)}</span>
              <button
                onClick={() => setPainelAberto(true)}
                aria-label="Ver painel de premios"
                className="text-creme/50 hover:text-ouro-400 transition-colors text-base sm:text-lg leading-none"
              >
                💰
              </button>
            </>
          )}
          {jogo.vozSuportada && (
            <button
              onClick={jogo.alternarModoMicrofone}
              aria-label={jogo.modoMicrofone ? "Desativar resposta por voz" : "Ativar resposta por voz"}
              className={`text-base sm:text-lg leading-none transition-colors ${
                jogo.modoMicrofone ? (jogo.vozCapturando ? "text-queda-500 animate-pulse" : "text-ouro-400") : "text-creme/50 hover:text-ouro-400"
              }`}
            >
              {jogo.modoMicrofone ? "🎤" : "🎙️"}
            </button>
          )}
          <button
            onClick={alternarSom}
            aria-label={mudo ? "Ativar som" : "Desativar som"}
            className="text-creme/50 hover:text-ouro-400 transition-colors text-base sm:text-lg leading-none"
          >
            {mudo ? "🔇" : "🔊"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-3 sm:py-6 landscape:py-2 gap-3 sm:gap-5 landscape:gap-2 overflow-y-auto">
        {jogo.erro && (
          <div className="max-w-md w-full text-center text-sm bg-queda-500/10 border border-queda-500 text-queda-500 rounded-lg px-4 py-3">
            {jogo.erro}
          </div>
        )}

        {jogo.fase === "nome" && (
          <div className="flex flex-col items-center gap-4 sm:gap-5 text-center max-w-md animate-entrada">
            <h1 className="titulo-jogo text-2xl sm:text-4xl text-ouro-400">Entre no jogo</h1>
            <p className="text-creme/70 text-sm sm:text-base">
              {usuario
                ? `Pronto, ${usuario.nomeJogador}? Seus resultados entram automaticamente no ranking.`
                : "Digite seu nome para ser sorteado como Lider e encarar adversarios controlados pela CPU."}
            </p>
            <input
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              placeholder="Seu nome"
              maxLength={30}
              readOnly={!!usuario}
              className="w-full px-4 py-3 rounded-lg bg-palco-800 border border-palco-700 focus:border-ouro-500 outline-none text-center disabled:opacity-70"
            />
            {jogo.vozSuportada && (
              <label className="flex items-center gap-2 text-xs text-creme/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={jogo.modoMicrofone}
                  onChange={jogo.alternarModoMicrofone}
                  className="accent-ouro-500"
                />
                Jogar respondendo por voz (microfone) quando for minha vez
              </label>
            )}
            <button
              onClick={() => nomeInput.trim() && jogo.iniciarJogo(nomeInput.trim())}
              disabled={!nomeInput.trim() || jogo.carregando}
              className="px-8 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
            >
              {jogo.carregando ? "Sorteando..." : "Comecar"}
            </button>
            {!usuario && (
              <Link to="/registrar" className="text-xs text-creme/40 hover:text-creme/70">
                Crie uma conta para salvar seu historico
              </Link>
            )}
          </div>
        )}

        {jogo.fase === "sorteando" && (
          <p className="titulo-jogo text-2xl text-ouro-400 animate-pulse">Sorteando adversarios...</p>
        )}

        {jogo.fase === "escolhendo" && (
          <div className="w-full flex flex-col items-center gap-3 sm:gap-5 animate-entrada">
            <h2 className="titulo-jogo text-lg sm:text-3xl text-ouro-400 text-center">
              Escolha quem voce vai desafiar
            </h2>
            {marco && (
              <p className="titulo-jogo text-sm sm:text-lg text-acerto-400 text-center px-4 py-1.5 rounded-full border border-acerto-500 bg-acerto-500/10 animate-entrada">
                {marco}
              </p>
            )}
            <Palco
              adversarios={jogo.adversarios}
              adversarioAtualEstacao={null}
              vidas={jogo.vidas}
              selecionavel
              onSelecionar={jogo.selecionarAdversario}
            />
          </div>
        )}

        {jogo.fase === "duelo" && (
          <div className="w-full flex flex-col items-center gap-2.5 sm:gap-5 landscape:gap-1.5">
            <Palco
              adversarios={jogo.adversarios}
              adversarioAtualEstacao={jogo.adversarioAtual?.estacao ?? null}
              vidas={jogo.vidas}
            />

            {jogo.adversarioAtual && (
              <div className="flex items-center gap-2 sm:gap-3 bg-palco-800 border border-palco-700 rounded-full px-3 sm:px-5 py-1 sm:py-2 animate-entrada">
                <span className="text-lg sm:text-2xl">{jogo.adversarioAtual.emoji}</span>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold leading-tight">{jogo.adversarioAtual.nome}</p>
                  <p className="text-[10px] sm:text-[11px] text-creme/50 italic leading-tight hidden sm:block">
                    "{jogo.adversarioAtual.frase}"
                  </p>
                </div>
              </div>
            )}

            <span
              className={`text-[10px] sm:text-xs uppercase tracking-widest px-3 sm:px-4 py-1 rounded-full border transition-colors ${
                jogo.turno === "lider"
                  ? "border-ouro-500 text-ouro-400"
                  : "border-queda-500 text-queda-500"
              }`}
            >
              {jogo.turno === "lider" ? "Sua vez" : `Vez de ${jogo.adversarioAtual?.nome ?? "adversario"}`}
            </span>

            {jogo.turno === "lider" && jogo.modoMicrofone && !jogo.aguardandoCPU && (
              <span
                className={`text-[10px] sm:text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                  jogo.vozCapturando ? "border-queda-500 text-queda-500" : "border-palco-700 text-creme/40"
                }`}
              >
                <span className={jogo.vozCapturando ? "animate-pulse" : ""}>🎤</span>
                {jogo.vozCapturando ? "Ouvindo... fale sua resposta" : "Microfone em espera"}
              </span>
            )}

            {jogo.aguardandoCPU && (
              <p className="text-ouro-400 text-sm animate-pulse">
                {jogo.adversarioAtual?.nome ?? "O adversario"} esta pensando...
              </p>
            )}

            {!jogo.aguardandoCPU && jogo.tipoRodada === "multipla-escolha" && jogo.perguntaAtual && (
              <div key={`mc-${jogo.rodadaChave}`} className="w-full animate-entrada">
                <DuelPanel
                  pergunta={jogo.perguntaAtual}
                  perguntaChave={String(jogo.rodadaChave)}
                  onResponder={jogo.responderMultiplaEscolha}
                  onEsgotarTempo={jogo.esgotarTempo}
                  podeRepassar={jogo.podeRepassar}
                  onRepassar={jogo.repassar}
                  bloqueado={jogo.bloqueado}
                  opcaoSelecionada={jogo.opcaoSelecionada}
                  mostrarCorreta={jogo.mostrarCorreta}
                  mostrarTimer={jogo.turno === "lider"}
                />
              </div>
            )}

            {!jogo.aguardandoCPU && jogo.tipoRodada === "letras-embaralhadas" && jogo.palavraAtual && (
              <div key={`le-${jogo.rodadaChave}`} className="w-full flex flex-col items-center gap-2 sm:gap-4 animate-entrada">
                <LetrasEmbaralhadas
                  palavra={jogo.palavraAtual}
                  chave={String(jogo.rodadaChave)}
                  onResultado={jogo.responderLetras}
                  onEsgotarTempo={jogo.esgotarTempo}
                  bloqueado={jogo.bloqueado}
                  espectador={jogo.turno === "adversario"}
                  sucessoEspectador={jogo.sucessoEspectadorPalavra}
                />
                {jogo.podeRepassar && (
                  <button
                    onClick={jogo.repassar}
                    className="text-xs sm:text-sm px-4 py-2 rounded-lg border border-ouro-500 text-ouro-400 hover:bg-ouro-500/10 transition-colors"
                  >
                    Usar vida para repassar ao adversario
                  </button>
                )}
              </div>
            )}

            {!jogo.aguardandoCPU && jogo.tipoRodada === "sim-ou-nao" && jogo.afirmacaoAtual && (
              <div key={`sn-${jogo.rodadaChave}`} className="w-full flex flex-col items-center gap-2 sm:gap-4 animate-entrada">
                <SimOuNao
                  afirmacao={jogo.afirmacaoAtual}
                  chave={String(jogo.rodadaChave)}
                  onResponder={jogo.responderSimOuNao}
                  onEsgotarTempo={jogo.esgotarTempo}
                  bloqueado={jogo.bloqueado}
                  mostrarResultado={jogo.mostrarCorreta}
                  escolhaFeita={jogo.escolhaSimOuNao}
                  mostrarTimer={jogo.turno === "lider"}
                />
                {jogo.podeRepassar && (
                  <button
                    onClick={jogo.repassar}
                    className="text-xs sm:text-sm px-4 py-2 rounded-lg border border-ouro-500 text-ouro-400 hover:bg-ouro-500/10 transition-colors"
                  >
                    Usar vida para repassar ao adversario
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {jogo.fase === "coin" && jogo.moedaOuro && jogo.moedaPrata && (
          <div className="animate-entrada w-full">
            <CoinChoice
              ouro={jogo.moedaOuro}
              prata={jogo.moedaPrata}
              onEscolher={jogo.escolherMoeda}
              onContinuar={jogo.continuarAposMoeda}
            />
          </div>
        )}

        {jogo.fase === "grande-decisao" && (
          <div className="animate-entrada w-full">
            <GrandeDecisao
              premioAtual={jogo.premio}
              onParar={jogo.pararNaGrandeDecisao}
              onArriscar={jogo.arriscarDesafioFinal}
            />
          </div>
        )}

        {jogo.fase === "final" && (
          <DesafioFinal onFinalizar={jogo.finalizarDesafioFinal} idsExcluidos={jogo.obterPerguntasUsadas()} />
        )}

        {jogo.fase === "fim" && jogo.resultadoFinal && (
          <div className="flex flex-col items-center gap-4 sm:gap-5 text-center max-w-md animate-entrada">
            <h2 className="titulo-jogo text-xl sm:text-3xl text-ouro-400">
              {jogo.resultadoFinal.sucesso ? "Fim de jogo!" : "Voce caiu no alcapao!"}
            </h2>
            <p className="text-creme/70 text-sm sm:text-base">
              {jogo.resultadoFinal.chegouAoDesafioFinal
                ? jogo.resultadoFinal.dobrouPremio
                  ? "Voce arriscou tudo no desafio final e dobrou o premio!"
                  : "Voce arriscou no desafio final, mas nao conseguiu completar as 10 perguntas a tempo."
                : jogo.resultadoFinal.sucesso
                ? "Voce decidiu parar com seguranca na Grande Decisao."
                : "Sua jornada terminou antes da Grande Decisao."}
            </p>
            <p className="titulo-jogo text-2xl sm:text-4xl">
              {formatarMoeda(jogo.resultadoFinal.premioFinal)}
            </p>
            <div className="flex gap-4">
              <button
                onClick={jogo.jogarNovamente}
                className="px-6 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors"
              >
                Jogar novamente
              </button>
              <Link
                to="/ranking"
                className="px-6 py-3 rounded-lg border border-palco-700 hover:border-ouro-500 transition-colors"
              >
                Ver ranking
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
