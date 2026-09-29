import { Router } from "express";
import { searchController } from "../controllers/searchController";

const router = Router();

router.get("/", (req, res) => searchController.search(req, res));
router.get("/:id", (req, res) => searchController.getSection(req, res));

export default router;
