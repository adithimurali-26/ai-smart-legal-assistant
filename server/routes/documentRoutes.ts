import { Router } from "express";
import { documentController, uploadMiddleware } from "../controllers/documentController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.use(optionalAuth);
router.post("/upload", uploadMiddleware.single("file"), (req, res) => documentController.upload(req, res));
router.get("/", (req, res) => documentController.getDocuments(req, res));
router.get("/:id", (req, res) => documentController.getDocumentAnalysis(req, res));

export default router;
