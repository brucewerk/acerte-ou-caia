import { Router } from "express";
import {
  gerarNovaPartida,
  respostaCPU,
  repassarCPU,
  moedaCPU,
  decisaoFinalCPU,
  registrarResultado,
} from "../controllers/gameController";

const router = Router();

router.get("/adversarios", gerarNovaPartida);
router.post("/cpu/responder", respostaCPU);
router.post("/cpu/repassar", repassarCPU);
router.get("/cpu/moeda", moedaCPU);
router.post("/cpu/decisao-final", decisaoFinalCPU);
router.post("/resultado", registrarResultado);

export default router;
