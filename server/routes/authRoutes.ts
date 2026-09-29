import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", authenticateToken, (req, res) => authController.me(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
