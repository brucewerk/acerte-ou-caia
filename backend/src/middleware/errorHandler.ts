import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ erro: "Rota nao encontrada" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[erro]", err);
  const status = err.status || 500;
  res.status(status).json({ erro: err.message || "Erro interno no servidor" });
}
