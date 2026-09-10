import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequisicaoAutenticada extends Request {
  usuarioId?: string;
}

/** Exige um token JWT valido no header Authorization: Bearer <token>. */
export function authUsuario(req: RequisicaoAutenticada, res: Response, next: NextFunction) {
  const cabecalho = req.header("Authorization");
  const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: "Faca login para continuar." });
  }

  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    return res.status(500).json({ erro: "JWT_SECRET nao configurado no servidor." });
  }

  try {
    const payload = jwt.verify(token, segredo) as { usuarioId: string };
    req.usuarioId = payload.usuarioId;
    next();
  } catch {
    return res.status(401).json({ erro: "Sessao invalida ou expirada. Faca login novamente." });
  }
}

/** Igual a authUsuario, mas nao bloqueia a requisicao se nao houver token -
 * apenas anexa o usuarioId quando um token valido estiver presente. Usado em
 * rotas que funcionam tanto para visitantes quanto para usuarios logados. */
export function authOpcional(req: RequisicaoAutenticada, res: Response, next: NextFunction) {
  const cabecalho = req.header("Authorization");
  const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  const segredo = process.env.JWT_SECRET;

  if (!token || !segredo) return next();

  try {
    const payload = jwt.verify(token, segredo) as { usuarioId: string };
    req.usuarioId = payload.usuarioId;
  } catch {
    // token invalido/expirado: segue como visitante, sem travar a requisicao
  }
  next();
}
