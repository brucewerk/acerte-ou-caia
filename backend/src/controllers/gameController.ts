import { Request, Response, NextFunction } from "express";
import { GameResult } from "../models/GameResult";
import {
  gerarAdversarios,
  decidirRespostaCPU,
  cpuDecideRepassarPergunta,
  cpuEscolheMoeda,
  cpuDecideArriscarFinal,
} from "../cpu/cpuEngine";
import { NivelCPU } from "../types";
import { RequisicaoAutenticada } from "../middleware/authUsuario";

// GET /api/game/adversarios -> gera os 10 adversarios (estacoes 1 a 10) de uma nova partida
export function gerarNovaPartida(req: Request, res: Response) {
  const adversarios = gerarAdversarios(10);
  res.json({ adversarios });
}

// POST /api/game/cpu/responder { nivel } -> simula a resposta da CPU a pergunta atual
export function respostaCPU(req: Request, res: Response) {
  const nivel = req.body.nivel as NivelCPU;
  if (!nivel) return res.status(400).json({ erro: "Informe o nivel da CPU" });
  const resultado = decidirRespostaCPU(nivel);
  res.json(resultado);
}

// POST /api/game/cpu/repassar { nivel, vidasDisponiveis }
export function repassarCPU(req: Request, res: Response) {
  const { nivel, vidasDisponiveis } = req.body as { nivel: NivelCPU; vidasDisponiveis: number };
  const repassa = cpuDecideRepassarPergunta(nivel, vidasDisponiveis ?? 0);
  res.json({ repassa });
}

// GET /api/game/cpu/moeda -> CPU escolhe ouro (0) ou prata (1)
export function moedaCPU(req: Request, res: Response) {
  res.json({ moeda: cpuEscolheMoeda() });
}

// POST /api/game/cpu/decisao-final { nivel }
export function decisaoFinalCPU(req: Request, res: Response) {
  const nivel = req.body.nivel as NivelCPU;
  const arrisca = cpuDecideArriscarFinal(nivel);
  res.json({ arrisca });
}

// POST /api/game/resultado -> registra o resultado de uma partida concluida
// (autenticacao opcional: visitantes tambem podem salvar resultado no ranking)
export async function registrarResultado(req: RequisicaoAutenticada, res: Response, next: NextFunction) {
  try {
    const { jogador, premioFinal, duelosVencidos, chegouAoDesafioFinal, dobrouPremio } = req.body;

    if (!jogador || typeof premioFinal !== "number") {
      return res.status(400).json({ erro: "Dados incompletos para registrar o resultado" });
    }

    const resultado = await GameResult.create({
      jogador,
      usuarioId: req.usuarioId || undefined,
      premioFinal,
      duelosVencidos: duelosVencidos ?? 0,
      chegouAoDesafioFinal: !!chegouAoDesafioFinal,
      dobrouPremio: !!dobrouPremio,
    });

    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}
