import { Request, Response, NextFunction } from "express";
import { Afirmacao } from "../models/Afirmacao";
import { parseIdsExcluidos } from "../utils/excluirIds";

// GET /api/afirmacoes/random?quantidade=1&excluir=id1,id2&categoria=esportes -> usado na rodada "Sim ou Nao"
// O parametro "categoria" permite puxar afirmacoes do mesmo tema, para que um duelo inteiro
// gire em torno do mesmo assunto.
export async function sortearAfirmacoes(req: Request, res: Response, next: NextFunction) {
  try {
    const quantidade = Math.min(Number(req.query.quantidade) || 1, 20);
    const idsExcluidos = parseIdsExcluidos(req.query.excluir);
    const categoria = req.query.categoria as string | undefined;

    const match: Record<string, unknown> = { ativa: true };
    if (idsExcluidos.length) match._id = { $nin: idsExcluidos };
    if (categoria) match.categoria = categoria;

    const afirmacoes = await Afirmacao.aggregate([
      { $match: match },
      { $sample: { size: quantidade } },
    ]);
    res.json(afirmacoes);
  } catch (err) {
    next(err);
  }
}

// GET /api/afirmacoes (admin)
export async function listarAfirmacoes(req: Request, res: Response, next: NextFunction) {
  try {
    const afirmacoes = await Afirmacao.find().sort({ createdAt: -1 });
    res.json(afirmacoes);
  } catch (err) {
    next(err);
  }
}

// POST /api/afirmacoes (admin)
export async function criarAfirmacao(req: Request, res: Response, next: NextFunction) {
  try {
    const afirmacao = await Afirmacao.create(req.body);
    res.status(201).json(afirmacao);
  } catch (err) {
    next(err);
  }
}

// PUT /api/afirmacoes/:id (admin)
export async function atualizarAfirmacao(req: Request, res: Response, next: NextFunction) {
  try {
    const afirmacao = await Afirmacao.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!afirmacao) return res.status(404).json({ erro: "Afirmacao nao encontrada" });
    res.json(afirmacao);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/afirmacoes/:id (admin)
export async function removerAfirmacao(req: Request, res: Response, next: NextFunction) {
  try {
    const afirmacao = await Afirmacao.findByIdAndDelete(req.params.id);
    if (!afirmacao) return res.status(404).json({ erro: "Afirmacao nao encontrada" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
