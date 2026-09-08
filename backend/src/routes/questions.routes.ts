import { Router } from "express";
import {
  listarPerguntas,
  sortearPerguntas,
  criarPergunta,
  atualizarPergunta,
  removerPergunta,
  estatisticasPerguntas,
} from "../controllers/questionController";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

// Rotas publicas (usadas durante a partida)
router.get("/random", sortearPerguntas);

// Rotas de administrador (CRUD completo do banco de perguntas)
router.get("/stats", adminAuth, estatisticasPerguntas);
router.get("/", adminAuth, listarPerguntas);
router.post("/", adminAuth, criarPergunta);
router.put("/:id", adminAuth, atualizarPergunta);
router.delete("/:id", adminAuth, removerPergunta);

export default router;
