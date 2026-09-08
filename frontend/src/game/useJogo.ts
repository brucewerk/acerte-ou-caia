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
import { sortearParDeMoedas } from "./premios";
import { atribuirPersonas } from "./personas";

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
const DELAY_MAXIMO_UX_MS = 4500; // limite pratico de espera visual pela resposta da CPU

/** Sorteia o tipo da proxima rodada: a maioria e de multipla escolha, com rodadas especiais ocasionais. */
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

  const [resultadoFinal, setResultadoFinal] = useState<{
    sucesso: boolean;
    premioFinal: number;
    chegouAoDesafioFinal: boolean;
    dobrouPremio: boolean;
  } | null>(null);

  const usouRepasseNaRodada = useRef(false);

  const adversarioAtual = adversarios.find((a) => a.estacao === adversarioAtualEstacao) ?? null;

  /** Busca o conteudo da proxima rodada do Lider, sorteando o tipo de rodada. */
  const iniciarTurnoLider = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setTurno("lider");
    usouRepasseNaRodada.current = false;

    const tipo = sortearTipoRodada();
    setTipoRodada(tipo);
    setOpcaoSelecionada(null);
    setEscolhaSimOuNao(null);
    setMostrarCorreta(false);
    setBloqueado(false);

    try {
      if (tipo === "multipla-escolha") {
        const [pergunta] = await buscarPerguntas(1);
        setPerguntaAtual(pergunta ?? null);
        setPalavraAtual(null);
        setAfirmacaoAtual(null);
      } else if (tipo === "letras-embaralhadas") {
        const [palavra] = await buscarPalavras(1);
        setPalavraAtual(palavra ?? null);
        setPerguntaAtual(null);
        setAfirmacaoAtual(null);
      } else {
        const [afirmacao] = await buscarAfirmacoes(1);
        setAfirmacaoAtual(afirmacao ?? null);
        setPerguntaAtual(null);
        setPalavraAtual(null);
      }
      setRodadaChave((v) => v + 1);
    } catch {
      setErro("Nao foi possivel carregar a proxima rodada. Verifique a API e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const iniciarJogo = useCallback(async (nome: string) => {
    setNomeJogador(nome);
    setFase("sorteando");
    setCarregando(true);
    setErro(null);
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

  /** O jogador escolhe, entre as estacoes restantes, qual adversario vai enfrentar. */
  const selecionarAdversario = useCallback(
    async (estacao: number) => {
      setAdversarioAtualEstacao(estacao);
      setFase("duelo");
      await iniciarTurnoLider();
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
    setQueda({ visivel: true, quemCaiu: "jogador" });
    setTimeout(() => {
      setQueda({ visivel: false, quemCaiu: "jogador" });
      salvarResultado(0, { chegouAoDesafioFinal: false, dobrouPremio: false, sucesso: false });
    }, 1300);
  }, [salvarResultado]);

  const adversarioCaiu = useCallback(() => {
    setQueda({ visivel: true, quemCaiu: "adversario" });
    setTimeout(() => {
      setQueda({ visivel: false, quemCaiu: "adversario" });
      setAdversarios((atuais) =>
        atuais.map((a) => (a.estacao === adversarioAtualEstacao ? { ...a, derrotado: true } : a))
      );
      setDuelosVencidos((v) => v + 1);
      const par = sortearParDeMoedas();
      setMoedaOuro(par.ouro);
      setMoedaPrata(par.prata);
      setFase("coin");
    }, 1300);
  }, [adversarioAtualEstacao]);

  /** Chamado quando e a vez da CPU: ela responde de acordo com o seu nivel de inteligencia. */
  const turnoAdversario = useCallback(async () => {
    if (!adversarioAtual) return;
    setTurno("adversario");
    setBloqueado(true);
    setAguardandoCPU(true);

    try {
      const resultado = await respostaCPU(adversarioAtual.nivel);
      const espera = Math.min(resultado.tempoRespostaMs, DELAY_MAXIMO_UX_MS);
      setTimeout(async () => {
        setAguardandoCPU(false);
        if (resultado.acertou) {
          // O adversario sobreviveu esta rodada: a vez volta para o Lider.
          await iniciarTurnoLider();
        } else {
          adversarioCaiu();
        }
      }, espera);
    } catch {
      setAguardandoCPU(false);
      setErro("Falha ao consultar a decisao do adversario.");
      setBloqueado(false);
    }
  }, [adversarioAtual, adversarioCaiu, iniciarTurnoLider]);

  /** O Lider venceu a propria rodada: a vez passa para o adversario. */
  const venceuRodadaLider = useCallback(() => {
    setTimeout(() => turnoAdversario(), 500);
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
    setVidas((v) => v - 1);
    turnoAdversario();
  }, [bloqueado, vidas, adversarioAtual, turnoAdversario]);

  const escolherMoeda = useCallback(
    (moeda: "ouro" | "prata") => {
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
  };
}
