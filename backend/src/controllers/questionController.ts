import { Request, Response, NextFunction } from "express";
import { Question } from "../models/Question";
import { parseIdsExcluidos } from "../utils/excluirIds";

// GET /api/questions  (uso do admin - lista tudo, com filtros opcionais)
export async function listarPerguntas(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoria, dificuldade, ativa } = req.query;
    const filtro: Record<string, unknown> = {};
    if (categoria) filtro.categoria = categoria;
    if (dificuldade) filtro.dificuldade = dificuldade;
    if (ativa !== undefined) filtro.ativa = ativa === "true";

    const perguntas = await Question.find(filtro).sort({ createdAt: -1 });
    res.json(perguntas);
  } catch (err) {
    next(err);
  }
}

// GET /api/questions/random?quantidade=1&dificuldade=medio&excluir=id1,id2
// Usado durante a partida - nunca revela qual e a resposta correta antes da hora.
// "excluir" evita repetir perguntas ja sorteadas na mesma partida.
export async function sortearPerguntas(req: Request, res: Response, next: NextFunction) {
  try {
    const quantidade = Math.min(Number(req.query.quantidade) || 1, 50);
    const dificuldade = req.query.dificuldade as string | undefined;
    const idsExcluidos = parseIdsExcluidos(req.query.excluir);

    const match: Record<string, unknown> = { ativa: true };
    if (dificuldade) match.dificuldade = dificuldade;
    if (idsExcluidos.length) match._id = { $nin: idsExcluidos };

    const perguntas = await Question.aggregate([
      { $match: match },
      { $sample: { size: quantidade } },
    ]);

    res.json(perguntas);
  } catch (err) {
    next(err);
  }
}

// POST /api/questions  (admin)
export async function criarPergunta(req: Request, res: Response, next: NextFunction) {
  try {
    const pergunta = await Question.create(req.body);
    res.status(201).json(pergunta);
  } catch (err) {
    next(err);
  }
}

// PUT /api/questions/:id  (admin)
export async function atualizarPergunta(req: Request, res: Response, next: NextFunction) {
  try {
    const pergunta = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pergunta) return res.status(404).json({ erro: "Pergunta nao encontrada" });
    res.json(pergunta);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/questions/:id  (admin)
export async function removerPergunta(req: Request, res: Response, next: NextFunction) {
  try {
    const pergunta = await Question.findByIdAndDelete(req.params.id);
    if (!pergunta) return res.status(404).json({ erro: "Pergunta nao encontrada" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/questions/stats (admin) - quantas perguntas existem por categoria
export async function estatisticasPerguntas(req: Request, res: Response, next: NextFunction) {
  try {
    const total = await Question.countDocuments();
    const porCategoria = await Question.aggregate([
      { $group: { _id: "$categoria", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json({ total, porCategoria });
  } catch (err) {
    next(err);
  }
}
