import { Router } from "express";
import { savedController } from "../controllers/savedController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.get("/", (req, res) => savedController.getSaved(req, res));
router.post("/", (req, res) => savedController.saveResponse(req, res));
router.delete("/:id", (req, res) => savedController.deleteSaved(req, res));

export default router;
