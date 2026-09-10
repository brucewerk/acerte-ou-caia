import { useCallback, useRef, useState } from "react";
import { Adversario, Afirmacao, Palavra, Pergunta, PremioOuModificador, TipoRodada, Turno } from "../types";
import {
  buscarPerguntas,
  buscarPalavras,
  buscarAfirmacoes,
  gerarAdversarios as apiGerarAdversarios,
  respostaCPU,
  registrarResultado,
} from "../api/game";
import { montarPoolDeFichas, FichaPainel } from "./premios";
import { atribuirPersonas } from "./personas";
import { sons } from "./sons";
import { useReconhecimentoVoz } from "./useReconhecimentoVoz";
import { combinarRespostaMultiplaEscolha, combinarSimOuNao, combinarPalavra } from "./matchVoz";

export type FaseJogo =
  | "nome"
  | "sorteando"
  | "escolhendo"
  | "duelo"
  | "coin"
  | "grande-decisao"
  | "final"
  | "fim";

export interface EstadoQueda {
  visivel: boolean;
  quemCaiu: "jogador" | "adversario";
}

const VIDAS_INICIAIS = 3;
const MAX_VIDAS = 3;
const TOTAL_DUELOS = 10;
const DELAY_MAXIMO_UX_MS = 4200; // limite pratico de espera visual pela resposta da CPU
const DELAY_MINIMO_UX_MS = 1400;

/** Sorteia o tipo de rodada de um duelo inteiro (fixo do primeiro ao ultimo turno contra aquele adversario). */
function sortearTipoRodada(): TipoRodada {
  const r = Math.random();
  if (r < 0.62) return "multipla-escolha";
  if (r < 0.81) return "letras-embaralhadas";
  return "sim-ou-nao";
}

export function useJogo() {
  const [fase, setFase] = useState<FaseJogo>("nome");
  const [nomeJogador, setNomeJogador] = useState("");
  const [vidas, setVidas] = useState(VIDAS_INICIAIS);
  const [premio, setPremio] = useState(0);
  const [duelosVencidos, setDuelosVencidos] = useState(0);
  const [adversarios, setAdversarios] = useState<Adversario[]>([]);
  const [adversarioAtualEstacao, setAdversarioAtualEstacao] = useState<number | null>(null);

  const [turno, setTurno] = useState<Turno>("lider");
  const [tipoRodada, setTipoRodada] = useState<TipoRodada>("multipla-escolha");
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
  const [palavraAtual, setPalavraAtual] = useState<Palavra | null>(null);
  const [afirmacaoAtual, setAfirmacaoAtual] = useState<Afirmacao | null>(null);
  const [rodadaChave, setRodadaChave] = useState(0);
  const [sucessoEspectadorPalavra, setSucessoEspectadorPalavra] = useState(false);

  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [escolhaSimOuNao, setEscolhaSimOuNao] = useState<boolean | null>(null);
  const [mostrarCorreta, setMostrarCorreta] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [aguardandoCPU, setAguardandoCPU] = useState(false);

  const [queda, setQueda] = useState<EstadoQueda>({ visivel: false, quemCaiu: "jogador" });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [moedaOuro, setMoedaOuro] = useState<PremioOuModificador | null>(null);
  const [moedaPrata, setMoedaPrata] = useState<PremioOuModificador | null>(null);
  const [fichasPainel, setFichasPainel] = useState<FichaPainel[]>([]);

  const [modoMicrofone, setModoMicrofone] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("aoc_modo_mic") === "true"
  );

  const [resultadoFinal, setResultadoFinal] = useState<{
    sucesso: boolean;
    premioFinal: number;
    chegouAoDesafioFinal: boolean;
    dobrouPremio: boolean;
  } | null>(null);

  const usouRepasseNaRodada = useRef(false);
  const perguntasUsadasRef = useRef<Set<string>>(new Set());
  const palavrasUsadasRef = useRef<Set<string>>(new Set());
  const afirmacoesUsadasRef = useRef<Set<string>>(new Set());

  const adversarioAtual = adversarios.find((a) => a.estacao === adversarioAtualEstacao) ?? null;

  /** Busca uma nova pergunta/palavra/afirmacao do tipo indicado, evitando repetir o que ja saiu nesta partida. */
  const carregarConteudo = useCallback(
    async (tipo: TipoRodada): Promise<Pergunta | Palavra | Afirmacao | null> => {
      try {
        if (tipo === "multipla-escolha") {
          const excluir = Array.from(perguntasUsadasRef.current).join(",");
          const [item] = await buscarPerguntas(1, undefined, excluir);
          if (item) perguntasUsadasRef.current.add(item._id);
          setPerguntaAtual(item ?? null);
          setPalavraAtual(null);
          setAfirmacaoAtual(null);
          return item ?? null;
        }
        if (tipo === "letras-embaralhadas") {
          const excluir = Array.from(palavrasUsadasRef.current).join(",");
          const [item] = await buscarPalavras(1, excluir);
          if (item) palavrasUsadasRef.current.add(item._id);
          setPalavraAtual(item ?? null);
          setPerguntaAtual(null);
          setAfirmacaoAtual(null);
          return item ?? null;
        }
        const excluir = Array.from(afirmacoesUsadasRef.current).join(",");
        const [item] = await buscarAfirmacoes(1, excluir);
        if (item) afirmacoesUsadasRef.current.add(item._id);
        setAfirmacaoAtual(item ?? null);
        setPerguntaAtual(null);
        setPalavraAtual(null);
        return item ?? null;
      } catch {
        setErro("Nao foi possivel carregar a proxima rodada. Verifique a API e tente novamente.");
        return null;
      }
    },
    []
  );

  /** Inicia um novo turno do Lider, usando o tipo de rodada fixo do duelo atual. */
  const iniciarTurnoLider = useCallback(
    async (tipoOverride?: TipoRodada) => {
      setCarregando(true);
      setErro(null);
      setTurno("lider");
      usouRepasseNaRodada.current = false;
      setOpcaoSelecionada(null);
      setEscolhaSimOuNao(null);
      setMostrarCorreta(false);
      setBloqueado(false);
      setAguardandoCPU(false);

      const tipo = tipoOverride ?? tipoRodada;
      await carregarConteudo(tipo);
      setRodadaChave((v) => v + 1);
      setCarregando(false);
    },
    [tipoRodada, carregarConteudo]
  );

  const iniciarJogo = useCallback(async (nome: string) => {
    setNomeJogador(nome);
    setFase("sorteando");
    setCarregando(true);
    setErro(null);
    perguntasUsadasRef.current.clear();
    palavrasUsadasRef.current.clear();
    afirmacoesUsadasRef.current.clear();
    setFichasPainel(montarPoolDeFichas());
    try {
      const novos = await apiGerarAdversarios();
      setAdversarios(atribuirPersonas(novos));
      setAdversarioAtualEstacao(null);
      setVidas(VIDAS_INICIAIS);
      setPremio(0);
      setDuelosVencidos(0);
      setFase("escolhendo");
    } catch {
      setErro("Nao foi possivel iniciar a partida. Verifique se a API esta no ar.");
      setFase("nome");
    } finally {
      setCarregando(false);
    }
  }, []);

  /** O jogador escolhe, entre as estacoes restantes, qual adversario vai enfrentar.
   * O tipo de rodada e sorteado aqui e permanece o mesmo ate o fim deste duelo. */
  const selecionarAdversario = useCallback(
    async (estacao: number) => {
      const tipoDoDuelo = sortearTipoRodada();
      setTipoRodada(tipoDoDuelo);
      setAdversarioAtualEstacao(estacao);
      setFase("duelo");
      await iniciarTurnoLider(tipoDoDuelo);
    },
    [iniciarTurnoLider]
  );

  const salvarResultado = useCallback(
    async (
      premioFinal: number,
      opts: { chegouAoDesafioFinal: boolean; dobrouPremio: boolean; sucesso: boolean }
    ) => {
      setResultadoFinal({ ...opts, premioFinal });
      setFase("fim");
      if (opts.sucesso && premioFinal > 0) sons.vitoria();
      try {
        await registrarResultado({
          jogador: nomeJogador || "Jogador",
          premioFinal,
          duelosVencidos,
          chegouAoDesafioFinal: opts.chegouAoDesafioFinal,
          dobrouPremio: opts.dobrouPremio,
        });
      } catch {
        // Falha ao salvar no ranking nao deve travar a tela de resultado do jogador.
      }
    },
    [nomeJogador, duelosVencidos]
  );

  const jogadorCaiu = useCallback(() => {
    sons.queda();
    setQueda({ visivel: true, quemCaiu: "jogador" });
    setTimeout(() => {
      setQueda({ visivel: false, quemCaiu: "jogador" });
      salvarResultado(0, { chegouAoDesafioFinal: false, dobrouPremio: false, sucesso: false });
    }, 1300);
  }, [salvarResultado]);

  const adversarioCaiu = useCallback(() => {
    sons.queda();
    setQueda({ visivel: true, quemCaiu: "adversario" });
    setTimeout(() => {
      setQueda({ visivel: false, quemCaiu: "adversario" });
      setAdversarios((atuais) =>
        atuais.map((a) => (a.estacao === adversarioAtualEstacao ? { ...a, derrotado: true } : a))
      );
      setDuelosVencidos((v) => v + 1);

      const disponiveis = fichasPainel.filter((f) => !f.revelada);
      const [fichaOuro, fichaPrata] = disponiveis.length >= 2 ? disponiveis : [
        { id: `extra-ouro-${Date.now()}`, rotulo: "R$ 1.000", premio: { tipo: "valor" as const, valor: 1000 }, revelada: false },
        { id: `extra-prata-${Date.now()}`, rotulo: "R$ 1.000", premio: { tipo: "valor" as const, valor: 1000 }, revelada: false },
      ];
      setMoedaOuro(fichaOuro.premio);
      setMoedaPrata(fichaPrata.premio);
      setFichasPainel((atuais) =>
        atuais.map((f) => (f.id === fichaOuro.id || f.id === fichaPrata.id ? { ...f, revelada: true } : f))
      );

      setFase("coin");
    }, 1300);
  }, [adversarioAtualEstacao, fichasPainel]);

  /** Turno da CPU: ela "pensa", uma rodada nova (mesmo tipo do duelo) e exibida, e a resposta
   * dela e revelada visualmente antes de decidir se ela cai ou devolve a vez ao Lider. */
  const turnoAdversario = useCallback(async () => {
    if (!adversarioAtual) return;
    sons.turno();
    setTurno("adversario");
    setBloqueado(true);
    setAguardandoCPU(true);
    setOpcaoSelecionada(null);
    setEscolhaSimOuNao(null);
    setMostrarCorreta(false);
    setSucessoEspectadorPalavra(false);

    try {
      const [conteudo, resultado] = await Promise.all([
        carregarConteudo(tipoRodada),
        respostaCPU(adversarioAtual.nivel),
      ]);
      setRodadaChave((v) => v + 1);

      const delayTotal = Math.min(Math.max(resultado.tempoRespostaMs, DELAY_MINIMO_UX_MS), DELAY_MAXIMO_UX_MS);
      const pensandoMs = Math.min(700, delayTotal * 0.35);
      const revelarMs = Math.max(900, delayTotal - pensandoMs);

      setTimeout(() => {
        setAguardandoCPU(false);

        if (tipoRodada === "multipla-escolha" && conteudo) {
          const pergunta = conteudo as Pergunta;
          const indiceEscolhido = resultado.acertou
            ? pergunta.respostaCorreta
            : (pergunta.respostaCorreta + 1 + Math.floor(Math.random() * 3)) % 4;
          setOpcaoSelecionada(indiceEscolhido);
          setMostrarCorreta(true);
        } else if (tipoRodada === "sim-ou-nao" && conteudo) {
          const afirmacao = conteudo as Afirmacao;
          setEscolhaSimOuNao(resultado.acertou ? afirmacao.verdadeira : !afirmacao.verdadeira);
          setMostrarCorreta(true);
        } else if (tipoRodada === "letras-embaralhadas") {
          setSucessoEspectadorPalavra(resultado.acertou);
        }

        resultado.acertou ? sons.acerto() : sons.erro();

        setTimeout(() => {
          if (resultado.acertou) {
            iniciarTurnoLider();
          } else {
            adversarioCaiu();
          }
        }, revelarMs);
      }, pensandoMs);
    } catch {
      setAguardandoCPU(false);
      setErro("Falha ao consultar a decisao do adversario.");
      setBloqueado(false);
    }
  }, [adversarioAtual, adversarioCaiu, iniciarTurnoLider, carregarConteudo, tipoRodada]);

  /** O Lider venceu a propria rodada: a vez passa para o adversario. */
  const venceuRodadaLider = useCallback(() => {
    sons.acerto();
    setTimeout(() => turnoAdversario(), 550);
  }, [turnoAdversario]);

  const responderMultiplaEscolha = useCallback(
    (indice: number) => {
      if (bloqueado || !perguntaAtual) return;
      setOpcaoSelecionada(indice);
      setMostrarCorreta(true);
      setBloqueado(true);

      const acertou = indice === perguntaAtual.respostaCorreta;
      setTimeout(() => {
        if (acertou) {
          venceuRodadaLider();
        } else {
          jogadorCaiu();
        }
      }, 1100);
    },
    [bloqueado, perguntaAtual, venceuRodadaLider, jogadorCaiu]
  );

  const responderLetras = useCallback(
    (sucesso: boolean) => {
      if (sucesso) {
        venceuRodadaLider();
      } else {
        sons.erro();
        jogadorCaiu();
      }
    },
    [venceuRodadaLider, jogadorCaiu]
  );

  const responderSimOuNao = useCallback(
    (escolhaVerdadeira: boolean) => {
      if (bloqueado || !afirmacaoAtual) return;
      setEscolhaSimOuNao(escolhaVerdadeira);
      setMostrarCorreta(true);
      setBloqueado(true);

      const acertou = escolhaVerdadeira === afirmacaoAtual.verdadeira;
      setTimeout(() => {
        if (acertou) {
          venceuRodadaLider();
        } else {
          jogadorCaiu();
        }
      }, 1100);
    },
    [bloqueado, afirmacaoAtual, venceuRodadaLider, jogadorCaiu]
  );

  const esgotarTempo = useCallback(() => {
    if (bloqueado) return;
    setBloqueado(true);
    setMostrarCorreta(true);
    setTimeout(() => jogadorCaiu(), 900);
  }, [bloqueado, jogadorCaiu]);

  const repassar = useCallback(() => {
    if (bloqueado || vidas <= 0 || !adversarioAtual || usouRepasseNaRodada.current) return;
    usouRepasseNaRodada.current = true;
    sons.clique();
    setVidas((v) => v - 1);
    turnoAdversario();
  }, [bloqueado, vidas, adversarioAtual, turnoAdversario]);

  const escolherMoeda = useCallback(
    (moeda: "ouro" | "prata") => {
      sons.moeda();
      const premioEscolhido = moeda === "ouro" ? moedaOuro : moedaPrata;
      if (!premioEscolhido) return;
      if (premioEscolhido.tipo === "valor") setPremio((p) => p + premioEscolhido.valor);
      if (premioEscolhido.tipo === "vida-extra") setVidas((v) => Math.min(v + 1, MAX_VIDAS));
      if (premioEscolhido.tipo === "dividir-por-2") setPremio((p) => Math.floor(p / 2));
      if (premioEscolhido.tipo === "perde-tudo") setPremio(0);
    },
    [moedaOuro, moedaPrata]
  );

  const continuarAposMoeda = useCallback(() => {
    setMoedaOuro(null);
    setMoedaPrata(null);
    setAdversarioAtualEstacao(null);
    if (duelosVencidos >= TOTAL_DUELOS) {
      setFase("grande-decisao");
      return;
    }
    setFase("escolhendo");
  }, [duelosVencidos]);

  const pararNaGrandeDecisao = useCallback(() => {
    salvarResultado(Math.floor(premio / 2), {
      chegouAoDesafioFinal: false,
      dobrouPremio: false,
      sucesso: true,
    });
  }, [premio, salvarResultado]);

  const arriscarDesafioFinal = useCallback(() => {
    setFase("final");
  }, []);

  const finalizarDesafioFinal = useCallback(
    (sucesso: boolean) => {
      if (sucesso) {
        salvarResultado(premio * 2, { chegouAoDesafioFinal: true, dobrouPremio: true, sucesso: true });
      } else {
        salvarResultado(0, { chegouAoDesafioFinal: true, dobrouPremio: false, sucesso: false });
      }
    },
    [premio, salvarResultado]
  );

  const jogarNovamente = useCallback(() => {
    setFase("nome");
    setResultadoFinal(null);
    setAdversarios([]);
    setAdversarioAtualEstacao(null);
    setPerguntaAtual(null);
    setPalavraAtual(null);
    setAfirmacaoAtual(null);
    setPremio(0);
    setVidas(VIDAS_INICIAIS);
    setDuelosVencidos(0);
    setMoedaOuro(null);
    setMoedaPrata(null);
  }, []);

  /** Ids de perguntas de multipla escolha ja usadas nesta partida, para o Desafio Final tambem evitar repetir. */
  const obterPerguntasUsadas = useCallback(() => Array.from(perguntasUsadasRef.current), []);

  // ---------- Modo microfone (responder por voz) ----------
  const ouvindoAgora = modoMicrofone && fase === "duelo" && turno === "lider" && !bloqueado && !aguardandoCPU;

  const aoReconhecerFala = useCallback(
    (transcricao: string) => {
      if (turno !== "lider" || bloqueado) return;
      if (tipoRodada === "multipla-escolha" && perguntaAtual) {
        const idx = combinarRespostaMultiplaEscolha(transcricao, perguntaAtual.opcoes);
        if (idx !== null) responderMultiplaEscolha(idx);
      } else if (tipoRodada === "sim-ou-nao" && afirmacaoAtual) {
        const resp = combinarSimOuNao(transcricao);
        if (resp !== null) responderSimOuNao(resp);
      } else if (tipoRodada === "letras-embaralhadas" && palavraAtual) {
        if (combinarPalavra(transcricao, palavraAtual.palavra)) responderLetras(true);
      }
    },
    [turno, bloqueado, tipoRodada, perguntaAtual, afirmacaoAtual, palavraAtual, responderMultiplaEscolha, responderSimOuNao, responderLetras]
  );

  const { suportado: vozSuportada, capturando: vozCapturando } = useReconhecimentoVoz({
    ativo: modoMicrofone,
    ouvindo: ouvindoAgora,
    onResultado: aoReconhecerFala,
  });

  const alternarModoMicrofone = useCallback(() => {
    setModoMicrofone((v) => {
      const novo = !v;
      if (typeof window !== "undefined") localStorage.setItem("aoc_modo_mic", String(novo));
      return novo;
    });
  }, []);

  return {
    fase,
    nomeJogador,
    vidas,
    premio,
    duelosVencidos,
    totalDuelos: TOTAL_DUELOS,
    adversarios,
    adversarioAtual,
    turno,
    tipoRodada,
    perguntaAtual,
    palavraAtual,
    afirmacaoAtual,
    rodadaChave,
    opcaoSelecionada,
    escolhaSimOuNao,
    mostrarCorreta,
    sucessoEspectadorPalavra,
    bloqueado: bloqueado || aguardandoCPU,
    aguardandoCPU,
    carregando,
    erro,
    queda,
    resultadoFinal,
    moedaOuro,
    moedaPrata,
    podeRepassar: vidas > 0 && !usouRepasseNaRodada.current && turno === "lider",
    iniciarJogo,
    selecionarAdversario,
    responderMultiplaEscolha,
    responderLetras,
    responderSimOuNao,
    esgotarTempo,
    repassar,
    escolherMoeda,
    continuarAposMoeda,
    pararNaGrandeDecisao,
    arriscarDesafioFinal,
    finalizarDesafioFinal,
    jogarNovamente,
    obterPerguntasUsadas,
    fichasPainel,
    modoMicrofone,
    vozSuportada,
    vozCapturando,
    alternarModoMicrofone,
  };
}
