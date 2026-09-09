import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app";
import { connectDB } from "../src/config/db";

const app = createApp();

/**
 * Ponto de entrada serverless para a Vercel. Qualquer arquivo dentro de
 * /api vira automaticamente uma funcao serverless; este arquivo delega
 * tudo para a mesma aplicacao Express usada em desenvolvimento local
 * (backend/src/server.ts), garantindo que as rotas se comportem de forma
 * identica nos dois ambientes.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return app(req as any, res as any);
}
