import { Router } from "express";
import { caseController } from "../controllers/caseController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.get("/", (req, res) => caseController.getCases(req, res));
router.post("/", (req, res) => caseController.createCase(req, res));
router.get("/:id", (req, res) => caseController.getCaseById(req, res));
router.patch("/:id", (req, res) => caseController.updateCase(req, res));

export default router;
