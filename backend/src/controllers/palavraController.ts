import { Request, Response, NextFunction } from "express";
import { Palavra } from "../models/Palavra";
import { parseIdsExcluidos } from "../utils/excluirIds";

// GET /api/palavras/random?quantidade=1&excluir=id1,id2 -> usado na rodada "Letras Embaralhadas"
export async function sortearPalavras(req: Request, res: Response, next: NextFunction) {
  try {
    const quantidade = Math.min(Number(req.query.quantidade) || 1, 20);
    const idsExcluidos = parseIdsExcluidos(req.query.excluir);

    const match: Record<string, unknown> = { ativa: true };
    if (idsExcluidos.length) match._id = { $nin: idsExcluidos };

    const palavras = await Palavra.aggregate([
      { $match: match },
      { $sample: { size: quantidade } },
    ]);
    res.json(palavras);
  } catch (err) {
    next(err);
  }
}

// GET /api/palavras (admin)
export async function listarPalavras(req: Request, res: Response, next: NextFunction) {
  try {
    const palavras = await Palavra.find().sort({ createdAt: -1 });
    res.json(palavras);
  } catch (err) {
    next(err);
  }
}

// POST /api/palavras (admin)
export async function criarPalavra(req: Request, res: Response, next: NextFunction) {
  try {
    const palavra = await Palavra.create(req.body);
    res.status(201).json(palavra);
  } catch (err) {
    next(err);
  }
}

// PUT /api/palavras/:id (admin)
export async function atualizarPalavra(req: Request, res: Response, next: NextFunction) {
  try {
    const palavra = await Palavra.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!palavra) return res.status(404).json({ erro: "Palavra nao encontrada" });
    res.json(palavra);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/palavras/:id (admin)
export async function removerPalavra(req: Request, res: Response, next: NextFunction) {
  try {
    const palavra = await Palavra.findByIdAndDelete(req.params.id);
    if (!palavra) return res.status(404).json({ erro: "Palavra nao encontrada" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
