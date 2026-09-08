import { Router } from "express";
import {
  sortearPalavras,
  listarPalavras,
  criarPalavra,
  atualizarPalavra,
  removerPalavra,
} from "../controllers/palavraController";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/random", sortearPalavras);

router.get("/", adminAuth, listarPalavras);
router.post("/", adminAuth, criarPalavra);
router.put("/:id", adminAuth, atualizarPalavra);
router.delete("/:id", adminAuth, removerPalavra);

export default router;
