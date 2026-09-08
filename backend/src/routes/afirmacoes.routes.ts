import { Router } from "express";
import {
  sortearAfirmacoes,
  listarAfirmacoes,
  criarAfirmacao,
  atualizarAfirmacao,
  removerAfirmacao,
} from "../controllers/afirmacaoController";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/random", sortearAfirmacoes);

router.get("/", adminAuth, listarAfirmacoes);
router.post("/", adminAuth, criarAfirmacao);
router.put("/:id", adminAuth, atualizarAfirmacao);
router.delete("/:id", adminAuth, removerAfirmacao);

export default router;
