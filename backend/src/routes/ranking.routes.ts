import { Router } from "express";
import { topRanking, removerResultado } from "../controllers/rankingController";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/", topRanking);
router.delete("/:id", adminAuth, removerResultado);

export default router;
