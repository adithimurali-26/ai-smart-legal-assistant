import { Router } from "express";
import { timelineController } from "../controllers/timelineController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.get("/:caseId", (req, res) => timelineController.getTimeline(req, res));
router.post("/:caseId", (req, res) => timelineController.addEvent(req, res));

export default router;
