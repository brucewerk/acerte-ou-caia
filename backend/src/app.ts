import express, { Application } from "express";
import cors from "cors";
import questionsRoutes from "./routes/questions.routes";
import palavrasRoutes from "./routes/palavras.routes";
import afirmacoesRoutes from "./routes/afirmacoes.routes";
import gameRoutes from "./routes/game.routes";
import rankingRoutes from "./routes/ranking.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, servico: "ACERTE ou CAIA by BruCe - API" });
  });

  app.use("/api/questions", questionsRoutes);
  app.use("/api/palavras", palavrasRoutes);
  app.use("/api/afirmacoes", afirmacoesRoutes);
  app.use("/api/game", gameRoutes);
  app.use("/api/ranking", rankingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
