import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../models/db";

export class AdvisorController {
  async getAdvisors(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const advisors = await db.all<any>("SELECT * FROM legal_advisors ORDER BY rating DESC");
      const parsed = advisors.map((a) => ({
        ...a,
        specialties: a.specialties ? JSON.parse(a.specialties) : [],
        barNo: a.bar_no,
      }));
      res.json(parsed);
    } catch (err: any) {
      console.error("[ADVISOR] getAdvisors error:", err);
      res.status(500).json({ error: "Failed to load advocates." });
    }
  }

  async getQueue(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const queue = await db.all<any>(
        `SELECT c.id, c.case_number, c.title, c.category, c.court, c.year,
                c.hearing_status as hearing, c.priority, c.preview, c.brief_json,
                u.full_name as user, u.email as user_email
         FROM cases c
         JOIN users u ON u.id = c.user_id
         ORDER BY c.created_at DESC`
      );

      const parsed = queue.map((c) => ({
        id: c.case_number,
        caseId: c.id,
        title: c.title,
        user: c.user,
        userEmail: c.user_email,
        court: c.court,
        year: c.year,
        hearing: c.hearing,
        priority: c.priority,
        preview: c.preview,
        brief: c.brief_json ? JSON.parse(c.brief_json) : null,
      }));

      res.json(parsed);
    } catch (err: any) {
      console.error("[ADVISOR] getQueue error:", err);
      res.status(500).json({ error: "Failed to load advisor queue." });
    }
  }

  async requestConsultation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required to request consultation." });
        return;
      }
      const { advisorId, caseId, conversationId, notes } = req.body;
      const id = `req-${Date.now()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO consultation_requests (id, user_id, advisor_id, case_id, conversation_id, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, advisorId || "adv-1", caseId || null, conversationId || null, "pending", notes || null, now, now]
      );

      res.status(201).json({
        message: "Consultation request dispatched to assigned counsel.",
        requestId: id,
        status: "pending",
      });
    } catch (err: any) {
      console.error("[ADVISOR] requestConsultation error:", err);
      res.status(500).json({ error: "Failed to dispatch consultation request." });
    }
  }

  async acceptCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { court, year, notes } = req.body;
      const now = new Date().toISOString();

      // Find case by id or case_number
      const caseItem = await db.get<any>(
        "SELECT id, case_number FROM cases WHERE id = ? OR case_number = ?",
        [id, id]
      );

      if (!caseItem) {
        res.status(404).json({ error: "Case not found." });
        return;
      }

      await db.run(
        `UPDATE cases
         SET status = 'under_review',
             hearing_status = 'Hearing scheduled / Action recorded',
             court = COALESCE(?, court),
             year = COALESCE(?, year),
             updated_at = ?
         WHERE id = ?`,
        [court || null, year || null, now, caseItem.id]
      );

      // Record timeline event
      await db.run(
        `INSERT INTO case_timeline_events (id, case_id, event_date, title, description, source_type, confirmed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `evt-${Date.now()}`,
          caseItem.id,
          new Date().toISOString().split("T")[0],
          "Advisor Consultation Accepted",
          notes || "Legal advocate accepted the case for statutory review and procedural action.",
          "advisor_input",
          1,
          now,
        ]
      );

      res.json({ message: "Case accepted and follow-up recorded successfully.", caseId: caseItem.id });
    } catch (err: any) {
      console.error("[ADVISOR] acceptCase error:", err);
      res.status(500).json({ error: "Failed to record advisor action." });
    }
  }
}

export const advisorController = new AdvisorController();
