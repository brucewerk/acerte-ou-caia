import { Request, Response, NextFunction } from "express";

/**
 * Protege rotas administrativas com uma chave simples enviada no header
 * "x-admin-key". Suficiente para um painel interno de administracao do jogo;
 * substitua por autenticacao completa (JWT/OAuth) se o projeto crescer.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const chaveEnviada = req.header("x-admin-key");
  const chaveEsperada = process.env.ADMIN_KEY;

  if (!chaveEsperada) {
    return res.status(500).json({ erro: "ADMIN_KEY nao configurada no servidor" });
  }

  if (chaveEnviada !== chaveEsperada) {
    return res.status(401).json({ erro: "Acesso de administrador negado" });
  }

  next();
}
