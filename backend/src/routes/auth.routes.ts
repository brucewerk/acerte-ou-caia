import { Router } from "express";
import { registrar, login, perfil, atualizarPerfil } from "../controllers/authController";
import { authUsuario } from "../middleware/authUsuario";

const router = Router();

router.post("/registrar", registrar);
router.post("/login", login);
router.get("/perfil", authUsuario, perfil);
router.put("/perfil", authUsuario, atualizarPerfil);

export default router;
