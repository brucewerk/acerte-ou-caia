import { useEffect, useRef, useState } from "react";

type ConstrutorReconhecimento = new () => any;

function obterConstrutor(): ConstrutorReconhecimento | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

/** true se o navegador suporta reconhecimento de fala (Web Speech API). */
export function reconhecimentoDeVozDisponivel(): boolean {
  return obterConstrutor() !== null;
}

interface OpcoesVoz {
  /** Modo microfone ligado pelo jogador nas configuracoes. */
  ativo: boolean;
  /** Deve estar capturando agora (ex.: e a vez do Lider e a rodada nao esta bloqueada). */
  ouvindo: boolean;
  onResultado: (transcricao: string) => void;
}

/**
 * Mantem um reconhecimento de fala continuo em portugues enquanto "ouvindo"
 * for verdadeiro, reiniciando automaticamente (o navegador para sozinho
 * apos alguns segundos de silencio). Entrega cada transcricao finalizada
 * via onResultado.
 */
export function useReconhecimentoVoz({ ativo, ouvindo, onResultado }: OpcoesVoz) {
  const suportado = useRef(reconhecimentoDeVozDisponivel()).current;
  const [capturando, setCapturando] = useState(false);
  const reconhecimentoRef = useRef<any>(null);
  const onResultadoRef = useRef(onResultado);
  onResultadoRef.current = onResultado;

  useEffect(() => {
    if (!suportado) return;
    const Construtor = obterConstrutor();
    if (!Construtor) return;

    const instancia = new Construtor();
    instancia.lang = "pt-BR";
    instancia.continuous = true;
    instancia.interimResults = false;

    instancia.onresult = (evento: any) => {
      const resultado = evento.results[evento.results.length - 1];
      if (resultado?.isFinal) {
        onResultadoRef.current(resultado[0].transcript as string);
      }
    };
    instancia.onend = () => setCapturando(false);
    instancia.onerror = () => setCapturando(false);

    reconhecimentoRef.current = instancia;
    return () => {
      instancia.onresult = null;
      instancia.onend = null;
      instancia.onerror = null;
      try {
        instancia.stop();
      } catch {
        // sem problema se ja estava parado
      }
    };
  }, [suportado]);

  useEffect(() => {
    if (!suportado || !ativo) return;
    const instancia = reconhecimentoRef.current;
    if (!instancia) return;

    if (ouvindo && !capturando) {
      try {
        instancia.start();
        setCapturando(true);
      } catch {
        // ja pode estar rodando (dupla chamada); ignora
      }
    } else if (!ouvindo && capturando) {
      try {
        instancia.stop();
      } catch {
        // sem problema
      }
      setCapturando(false);
    }
  }, [ativo, ouvindo, suportado, capturando]);

  return { suportado, capturando };
}
