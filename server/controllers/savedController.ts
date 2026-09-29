import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../models/db";

export class SavedController {
  async getSaved(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.json([]);
        return;
      }
      const saved = await db.all<any>(
        "SELECT * FROM saved_responses WHERE user_id = ? ORDER BY saved_at DESC",
        [userId]
      );
      res.json(saved);
    } catch (err: any) {
      console.error("[SAVED] getSaved error:", err);
      res.status(500).json({ error: "Failed to load saved responses." });
    }
  }

  async saveResponse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required to save responses." });
        return;
      }
      const { messageId, title, content, category = "General" } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: "Title and content are required." });
        return;
      }

      const id = `save-${Date.now()}`;
      const preview = content.length > 80 ? content.substring(0, 77) + "…" : content;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO saved_responses (id, user_id, message_id, title, content, preview, category, saved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, messageId || null, title, content, preview, category, now]
      );

      const created = await db.get("SELECT * FROM saved_responses WHERE id = ?", [id]);
      res.status(201).json(created);
    } catch (err: any) {
      console.error("[SAVED] saveResponse error:", err);
      res.status(500).json({ error: "Failed to save response." });
    }
  }

  async deleteSaved(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required." });
        return;
      }

      await db.run("DELETE FROM saved_responses WHERE id = ? AND user_id = ?", [id, userId]);
      res.json({ message: "Saved response removed." });
    } catch (err: any) {
      console.error("[SAVED] deleteSaved error:", err);
      res.status(500).json({ error: "Failed to remove saved response." });
    }
  }
}

export const savedController = new SavedController();
