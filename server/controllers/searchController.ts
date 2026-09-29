import { Request, Response } from "express";
import { ragService } from "../services/ragService";
import { db } from "../models/db";

export class SearchController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) || "";
      const category = (req.query.category as string) || "All";

      const results = await ragService.searchCatalogue(q, category);
      res.json(results);
    } catch (err: any) {
      console.error("[SEARCH] search error:", err);
      res.status(500).json({ error: "Failed to search statutory records." });
    }
  }

  async getSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await db.get("SELECT * FROM legal_sources WHERE id = ?", [id]);
      if (!record) {
        res.status(404).json({ error: "Statutory record not found." });
        return;
      }
      res.json({
        ...record,
        keywords: record.keywords ? JSON.parse(record.keywords) : [],
        verified: Boolean(record.verified),
      });
    } catch (err: any) {
      console.error("[SEARCH] getSection error:", err);
      res.status(500).json({ error: "Failed to fetch statutory record." });
    }
  }
}

export const searchController = new SearchController();
