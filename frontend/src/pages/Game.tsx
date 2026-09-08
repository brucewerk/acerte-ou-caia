import { useState } from "react";
import { Link } from "react-router-dom";
import { useJogo } from "../game/useJogo";
import { Palco } from "../components/Palco";
import { DuelPanel } from "../components/DuelPanel";
import { LetrasEmbaralhadas } from "../components/LetrasEmbaralhadas";
import { SimOuNao } from "../components/SimOuNao";
import { CoinChoice } from "../components/CoinChoice";
import { AlcapaoOverlay } from "../components/AlcapaoOverlay";
import { GrandeDecisao } from "../components/GrandeDecisao";
import { DesafioFinal } from "../components/DesafioFinal";

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Game() {
  const jogo = useJogo();
  const [nomeInput, setNomeInput] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <AlcapaoOverlay
        visivel={jogo.queda.visivel}
        quemCaiu={jogo.queda.quemCaiu}
        nomeAdversario={jogo.adversarioAtual?.nome}
      />

      <header className="px-6 py-4 flex items-center justify-between border-b border-palco-800">
        <Link to="/" className="titulo-jogo text-lg text-ouro-400">
          ACERTE <span className="text-creme">ou</span> CAIA
        </Link>
        {jogo.fase !== "nome" && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-creme/60">
              Duelo {Math.min(jogo.duelosVencidos + 1, jogo.totalDuelos)}/{jogo.totalDuelos}
            </span>
            <span className="titulo-jogo text-ouro-400">{formatarMoeda(jogo.premio)}</span>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-8">
        {jogo.erro && (
          <div className="max-w-md w-full text-center text-sm bg-queda-500/10 border border-queda-500 text-queda-500 rounded-lg px-4 py-3">
            {jogo.erro}
          </div>
        )}

        {jogo.fase === "nome" && (
          <div className="flex flex-col items-center gap-6 text-center max-w-md animate-entrada">
            <h1 className="titulo-jogo text-4xl text-ouro-400">Entre no jogo</h1>
            <p className="text-creme/70">
              Digite seu nome para ser sorteado como Lider e encarar 10 adversarios controlados
              pela CPU.
            </p>
            <input
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              placeholder="Seu nome"
              maxLength={30}
              className="w-full px-4 py-3 rounded-lg bg-palco-800 border border-palco-700 focus:border-ouro-500 outline-none text-center"
            />
            <button
              onClick={() => nomeInput.trim() && jogo.iniciarJogo(nomeInput.trim())}
              disabled={!nomeInput.trim() || jogo.carregando}
              className="px-8 py-3 rounded-lg bg-ouro-500 text-palco-950 font-semibold hover:bg-ouro-400 transition-colors disabled:opacity-50"
            >
              {jogo.carregando ? "Sorteando..." : "Comecar"}
            </button>
          </div>
        )}

        {jogo.fase === "sorteando" && (
          <p className="titulo-jogo text-2xl text-ouro-400 animate-pulse">Sorteando adversarios...</p>
        )}

        {jogo.fase === "escolhendo" && (
          <div className="w-full flex flex-col items-center gap-6 animate-entrada">
            <h2 className="titulo-jogo text-2xl sm:text-3xl text-ouro-400 text-center">
              Escolha quem voce vai desafiar
            </h2>
            <p className="text-creme/60 text-sm text-center max-w-md">
              Toque em uma estacao para iniciar o proximo duelo. Passe o mouse (ou segure no
              celular) para ver o nome do adversario.
            </p>
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
          <div className="w-full flex flex-col items-center gap-8">
            <Palco
              adversarios={jogo.adversarios}
              adversarioAtualEstacao={jogo.adversarioAtual?.estacao ?? null}
              vidas={jogo.vidas}
            />

            {jogo.adversarioAtual && (
              <div className="flex items-center gap-3 bg-palco-800 border border-palco-700 rounded-full px-5 py-2 animate-entrada">
                <span className="text-2xl">{jogo.adversarioAtual.emoji}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight">{jogo.adversarioAtual.nome}</p>
                  <p className="text-[11px] text-creme/50 italic leading-tight">
                    "{jogo.adversarioAtual.frase}"
                  </p>
                </div>
              </div>
            )}

            <span
              className={`text-xs uppercase tracking-widest px-4 py-1 rounded-full border transition-colors ${
                jogo.turno === "lider"
                  ? "border-ouro-500 text-ouro-400"
                  : "border-queda-500 text-queda-500"
              }`}
            >
              {jogo.turno === "lider" ? "Sua vez" : "Vez do adversario"}
            </span>

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
                />
              </div>
            )}

            {!jogo.aguardandoCPU && jogo.tipoRodada === "letras-embaralhadas" && jogo.palavraAtual && (
              <div key={`le-${jogo.rodadaChave}`} className="w-full flex flex-col items-center gap-4 animate-entrada">
                <LetrasEmbaralhadas
                  palavra={jogo.palavraAtual}
                  chave={String(jogo.rodadaChave)}
                  onResultado={jogo.responderLetras}
                  onEsgotarTempo={jogo.esgotarTempo}
                  bloqueado={jogo.bloqueado}
                />
                {jogo.podeRepassar && (
                  <button
                    onClick={jogo.repassar}
                    className="text-sm px-4 py-2 rounded-lg border border-ouro-500 text-ouro-400 hover:bg-ouro-500/10 transition-colors"
                  >
                    Usar vida para repassar a palavra ao adversario
                  </button>
                )}
              </div>
            )}

            {!jogo.aguardandoCPU && jogo.tipoRodada === "sim-ou-nao" && jogo.afirmacaoAtual && (
              <div key={`sn-${jogo.rodadaChave}`} className="w-full flex flex-col items-center gap-4 animate-entrada">
                <SimOuNao
                  afirmacao={jogo.afirmacaoAtual}
                  chave={String(jogo.rodadaChave)}
                  onResponder={jogo.responderSimOuNao}
                  onEsgotarTempo={jogo.esgotarTempo}
                  bloqueado={jogo.bloqueado}
                  mostrarResultado={jogo.mostrarCorreta}
                  escolhaFeita={jogo.escolhaSimOuNao}
                />
                {jogo.podeRepassar && (
                  <button
                    onClick={jogo.repassar}
                    className="text-sm px-4 py-2 rounded-lg border border-ouro-500 text-ouro-400 hover:bg-ouro-500/10 transition-colors"
                  >
                    Usar vida para repassar a afirmacao ao adversario
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

        {jogo.fase === "final" && <DesafioFinal onFinalizar={jogo.finalizarDesafioFinal} />}

        {jogo.fase === "fim" && jogo.resultadoFinal && (
          <div className="flex flex-col items-center gap-6 text-center max-w-md animate-entrada">
            <h2 className="titulo-jogo text-3xl text-ouro-400">
              {jogo.resultadoFinal.sucesso ? "Fim de jogo!" : "Voce caiu no alcapao!"}
            </h2>
            <p className="text-creme/70">
              {jogo.resultadoFinal.chegouAoDesafioFinal
                ? jogo.resultadoFinal.dobrouPremio
                  ? "Voce arriscou tudo no desafio final e dobrou o premio!"
                  : "Voce arriscou no desafio final, mas nao conseguiu completar as 10 perguntas a tempo."
                : jogo.resultadoFinal.sucesso
                ? "Voce decidiu parar com seguranca na Grande Decisao."
                : "Sua jornada terminou antes da Grande Decisao."}
            </p>
            <p className="titulo-jogo text-4xl">
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
