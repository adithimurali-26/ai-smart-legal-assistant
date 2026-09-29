import { Router } from "express";
import { advisorController } from "../controllers/advisorController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.get("/", (req, res) => advisorController.getAdvisors(req, res));
router.get("/queue", (req, res) => advisorController.getQueue(req, res));
router.post("/consult", (req, res) => advisorController.requestConsultation(req, res));
router.post("/accept-case/:id", (req, res) => advisorController.acceptCase(req, res));

export default router;
