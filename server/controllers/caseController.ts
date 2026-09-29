import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../models/db";

export class CaseController {
  async getCases(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.json([]);
        return;
      }
      const isAdvisor = req.user?.role === "advisor";

      let cases: any[];
      if (isAdvisor) {
        // Advisors see assigned cases or open cases needing review
        cases = await db.all<any>(
          `SELECT c.*, u.full_name as user_name, u.email as user_email
           FROM cases c
           JOIN users u ON u.id = c.user_id
           ORDER BY c.created_at DESC`
        );
      } else {
        cases = await db.all<any>(
          `SELECT c.*, a.name as advocate_name, a.title as advocate_title
           FROM cases c
           LEFT JOIN legal_advisors a ON a.id = c.assigned_advisor_id
           WHERE c.user_id = ?
           ORDER BY c.created_at DESC`,
          [userId]
        );
      }

      res.json(cases);
    } catch (err: any) {
      console.error("[CASE] getCases error:", err);
      res.status(500).json({ error: "Failed to load cases." });
    }
  }

  async getCaseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const caseItem = await db.get<any>(
        `SELECT c.*, u.full_name as user_name, u.email as user_email, a.name as advisor_name
         FROM cases c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN legal_advisors a ON a.id = c.assigned_advisor_id
         WHERE c.id = ?`,
        [id]
      );

      if (!caseItem) {
        res.status(404).json({ error: "Case not found." });
        return;
      }

      const timeline = await db.all<any>(
        `SELECT * FROM case_timeline_events WHERE case_id = ? ORDER BY event_date ASC`,
        [id]
      );

      const documents = await db.all<any>(
        `SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC`,
        [id]
      );

      res.json({
        case: {
          ...caseItem,
          brief: caseItem.brief_json ? JSON.parse(caseItem.brief_json) : null,
        },
        timeline,
        documents,
      });
    } catch (err: any) {
      console.error("[CASE] getCaseById error:", err);
      res.status(500).json({ error: "Failed to load case details." });
    }
  }

  async createCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required to create cases" });
        return;
      }
      const { title, category, preview, brief, assignedAdvisorId } = req.body;

      if (!title || !category) {
        res.status(400).json({ error: "Case title and category are required." });
        return;
      }

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const caseId = `case-${randomNum}`;
      const caseNumber = `CASE / ${randomNum}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO cases (id, case_number, user_id, assigned_advisor_id, title, category, court, year, hearing_status, priority, status, preview, brief_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId,
          caseNumber,
          userId,
          assignedAdvisorId || "adv-1",
          title,
          category,
          "—",
          new Date().getFullYear().toString(),
          "Awaiting first hearing",
          "Needs review",
          "open",
          preview || "Case opened for advocate review.",
          brief ? JSON.stringify(brief) : null,
          now,
          now,
        ]
      );

      const created = await db.get("SELECT * FROM cases WHERE id = ?", [caseId]);
      res.status(201).json(created);
    } catch (err: any) {
      console.error("[CASE] createCase error:", err);
      res.status(500).json({ error: "Failed to create case." });
    }
  }

  async updateCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { court, year, hearing_status, priority, status, notes } = req.body;

      const existing = await db.get("SELECT * FROM cases WHERE id = ?", [id]);
      if (!existing) {
        res.status(404).json({ error: "Case not found." });
        return;
      }

      const updatedCourt = court !== undefined ? court : existing.court;
      const updatedYear = year !== undefined ? year : existing.year;
      const updatedHearing = hearing_status !== undefined ? hearing_status : existing.hearing_status;
      const updatedPriority = priority !== undefined ? priority : existing.priority;
      const updatedStatus = status !== undefined ? status : existing.status;
      const now = new Date().toISOString();

      await db.run(
        `UPDATE cases
         SET court = ?, year = ?, hearing_status = ?, priority = ?, status = ?, updated_at = ?
         WHERE id = ?`,
        [updatedCourt, updatedYear, updatedHearing, updatedPriority, updatedStatus, now, id]
      );

      // If advisor added notes, optionally record timeline event
      if (notes) {
        await db.run(
          `INSERT INTO case_timeline_events (id, case_id, event_date, title, description, source_type, confirmed, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `evt-${Date.now()}`,
            id,
            new Date().toISOString().split("T")[0],
            "Advisor Follow-Up Recorded",
            notes,
            "advisor_input",
            1,
            now,
          ]
        );
      }

      const updated = await db.get("SELECT * FROM cases WHERE id = ?", [id]);
      res.json(updated);
    } catch (err: any) {
      console.error("[CASE] updateCase error:", err);
      res.status(500).json({ error: "Failed to update case." });
    }
  }
}

export const caseController = new CaseController();
