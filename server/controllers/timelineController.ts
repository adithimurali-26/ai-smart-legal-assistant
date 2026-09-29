import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../models/db";

export class TimelineController {
  async getTimeline(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const events = await db.all<any>(
        "SELECT * FROM case_timeline_events WHERE case_id = ? ORDER BY event_date ASC",
        [caseId]
      );
      res.json(events);
    } catch (err: any) {
      console.error("[TIMELINE] getTimeline error:", err);
      res.status(500).json({ error: "Failed to load timeline events." });
    }
  }

  async addEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const { event_date, title, description, source_type = "user_input" } = req.body;

      if (!event_date || !title) {
        res.status(400).json({ error: "Event date and title are required." });
        return;
      }

      const id = `evt-${Date.now()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO case_timeline_events (id, case_id, event_date, title, description, source_type, confirmed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, caseId, event_date, title, description || "", source_type, 1, now]
      );

      const created = await db.get("SELECT * FROM case_timeline_events WHERE id = ?", [id]);
      res.status(201).json(created);
    } catch (err: any) {
      console.error("[TIMELINE] addEvent error:", err);
      res.status(500).json({ error: "Failed to add timeline event." });
    }
  }
}

export const timelineController = new TimelineController();
