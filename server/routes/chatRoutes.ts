import { Router } from "express";
import { chatController } from "../controllers/chatController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.get("/conversations", (req, res) => chatController.getConversations(req, res));
router.post("/conversations", (req, res) => chatController.createConversation(req, res));
router.get("/conversations/:id", (req, res) => chatController.getConversationMessages(req, res));
router.post("/conversations/:id/messages", (req, res) => chatController.sendMessage(req, res));

export default router;
