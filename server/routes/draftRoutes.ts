import { Router } from "express";
import { draftController } from "../controllers/draftController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.post("/generate", (req, res) => draftController.generateDraft(req, res));
router.get("/", (req, res) => draftController.getDrafts(req, res));

export default router;
