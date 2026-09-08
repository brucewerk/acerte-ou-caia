import { Request, Response, NextFunction } from "express";
import { GameResult } from "../models/GameResult";

// GET /api/ranking -> top 10 maiores premios ja conquistados
export async function topRanking(req: Request, res: Response, next: NextFunction) {
  try {
    const top10 = await GameResult.find()
      .sort({ premioFinal: -1 })
      .limit(10)
      .select("jogador premioFinal duelosVencidos chegouAoDesafioFinal dobrouPremio data");

    res.json(top10);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/ranking/:id (admin) -> remove um resultado do ranking
export async function removerResultado(req: Request, res: Response, next: NextFunction) {
  try {
    const removido = await GameResult.findByIdAndDelete(req.params.id);
    if (!removido) return res.status(404).json({ erro: "Resultado nao encontrado" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
