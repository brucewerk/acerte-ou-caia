import { Response, NextFunction, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { RequisicaoAutenticada } from "../middleware/authUsuario";

function gerarToken(usuarioId: string): string {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) throw new Error("JWT_SECRET nao configurado no servidor.");
  return jwt.sign({ usuarioId }, segredo, { expiresIn: "30d" });
}

function paraPerfilPublico(usuario: { _id: unknown; email: string; nomeJogador: string; criadoEm: Date }) {
  return { id: usuario._id, email: usuario.email, nomeJogador: usuario.nomeJogador, criadoEm: usuario.criadoEm };
}

// POST /api/auth/registrar
export async function registrar(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, nomeJogador, senha } = req.body as {
      email?: string;
      nomeJogador?: string;
      senha?: string;
    };

    if (!email?.trim() || !nomeJogador?.trim() || !senha) {
      return res.status(400).json({ erro: "Preencha email, nome de jogador e senha." });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: "A senha precisa ter pelo menos 6 caracteres." });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const nomeNormalizado = nomeJogador.trim();

    const jaExiste = await User.findOne({
      $or: [{ email: emailNormalizado }, { nomeJogador: nomeNormalizado }],
    });
    if (jaExiste) {
      const campo = jaExiste.email === emailNormalizado ? "email" : "nome de jogador";
      return res.status(409).json({ erro: `Esse ${campo} ja esta em uso.` });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await User.create({ email: emailNormalizado, nomeJogador: nomeNormalizado, senhaHash });

    const token = gerarToken(String(usuario._id));
    res.status(201).json({ token, usuario: paraPerfilPublico(usuario) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identificador, senha } = req.body as { identificador?: string; senha?: string };
    if (!identificador?.trim() || !senha) {
      return res.status(400).json({ erro: "Informe seu email/nome de jogador e senha." });
    }

    const valor = identificador.trim();
    const usuario = await User.findOne({
      $or: [{ email: valor.toLowerCase() }, { nomeJogador: valor }],
    });

    if (!usuario || !(await usuario.compararSenha(senha))) {
      return res.status(401).json({ erro: "Credenciais invalidas." });
    }

    const token = gerarToken(String(usuario._id));
    res.json({ token, usuario: paraPerfilPublico(usuario) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/perfil (autenticado)
export async function perfil(req: RequisicaoAutenticada, res: Response, next: NextFunction) {
  try {
    const usuario = await User.findById(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado." });
    res.json(paraPerfilPublico(usuario));
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/perfil (autenticado) - atualiza email, nomeJogador e/ou senha
export async function atualizarPerfil(req: RequisicaoAutenticada, res: Response, next: NextFunction) {
  try {
    const usuario = await User.findById(req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado." });

    const { email, nomeJogador, senhaAtual, novaSenha } = req.body as {
      email?: string;
      nomeJogador?: string;
      senhaAtual?: string;
      novaSenha?: string;
    };

    if (email?.trim()) {
      const emailNormalizado = email.trim().toLowerCase();
      if (emailNormalizado !== usuario.email) {
        const emailEmUso = await User.findOne({ email: emailNormalizado });
        if (emailEmUso) return res.status(409).json({ erro: "Esse email ja esta em uso." });
        usuario.email = emailNormalizado;
      }
    }

    if (nomeJogador?.trim()) {
      const nomeNormalizado = nomeJogador.trim();
      if (nomeNormalizado !== usuario.nomeJogador) {
        const nomeEmUso = await User.findOne({ nomeJogador: nomeNormalizado });
        if (nomeEmUso) return res.status(409).json({ erro: "Esse nome de jogador ja esta em uso." });
        usuario.nomeJogador = nomeNormalizado;
      }
    }

    if (novaSenha) {
      if (!senhaAtual || !(await usuario.compararSenha(senhaAtual))) {
        return res.status(401).json({ erro: "Senha atual incorreta." });
      }
      if (novaSenha.length < 6) {
        return res.status(400).json({ erro: "A nova senha precisa ter pelo menos 6 caracteres." });
      }
      usuario.senhaHash = await bcrypt.hash(novaSenha, 10);
    }

    await usuario.save();
    res.json(paraPerfilPublico(usuario));
  } catch (err) {
    next(err);
  }
}
