import { Router } from "express";
import authRoutes from "./authRoutes";
import chatRoutes from "./chatRoutes";
import searchRoutes from "./searchRoutes";
import documentRoutes from "./documentRoutes";
import caseRoutes from "./caseRoutes";
import advisorRoutes from "./advisorRoutes";
import timelineRoutes from "./timelineRoutes";
import draftRoutes from "./draftRoutes";
import savedRoutes from "./savedRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/legal-search", searchRoutes);
router.use("/documents", documentRoutes);
router.use("/cases", caseRoutes);
router.use("/advisors", advisorRoutes);
router.use("/timeline", timelineRoutes);
router.use("/legal-drafts", draftRoutes);
router.use("/saved-responses", savedRoutes);

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Indian Legal Intelligence API", timestamp: new Date().toISOString() });
});

export default router;
