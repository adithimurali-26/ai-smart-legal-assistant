import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../models/db";
import { draftService, LegalDraftInput } from "../services/draftService";

export class DraftController {
  async generateDraft(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required to generate drafts" });
        return;
      }
      const { draftType, parties, facts, amountClaimed, demandedRelief, cureDays, caseId } = req.body;

      if (!draftType || !parties || !demandedRelief) {
        res.status(400).json({ error: "Draft type, parties, and demanded relief are required." });
        return;
      }

      let normalizedType: LegalDraftInput["draftType"] = "legal_notice";
      const dtLower = (draftType || "").toLowerCase();
      if (dtLower.includes("complaint") || dtLower.includes("petition")) {
        normalizedType = "complaint";
      } else if (dtLower.includes("affidavit")) {
        normalizedType = "affidavit";
      } else if (dtLower.includes("reply")) {
        normalizedType = "reply";
      } else if (dtLower.includes("agreement")) {
        normalizedType = "agreement";
      } else if (dtLower.includes("representation")) {
        normalizedType = "representation";
      }

      const normalizedParties = {
        senderName: parties.senderName || parties.claimant || "Aggrieved Party / Complainant",
        senderAddress: parties.senderAddress || parties.claimantAddress || "Chennai, Tamil Nadu",
        recipientName: parties.recipientName || parties.respondent || "Opposite Party / Respondent",
        recipientAddress: parties.recipientAddress || parties.respondentAddress || "Premises Address / Registered Office",
      };

      const input: LegalDraftInput = {
        draftType: normalizedType,
        parties: normalizedParties,
        facts: facts || "",
        amountClaimed: amountClaimed || "₹50,000/-",
        demandedRelief,
        cureDays: cureDays ? parseInt(cureDays, 10) : 15,
      };

      const { title, content } = draftService.generateDraft(input);

      const id = `draft-${Date.now()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO legal_drafts (id, user_id, case_id, draft_type, title, content, form_data, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, caseId || null, draftType, title, content, JSON.stringify(input), "draft", now, now]
      );

      res.status(201).json({
        id,
        title,
        content,
        draftType,
        status: "draft",
        createdAt: now,
      });
    } catch (err: any) {
      console.error("[DRAFT] generateDraft error:", err);
      res.status(500).json({ error: "Failed to generate legal draft." });
    }
  }

  async getDrafts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.json([]);
        return;
      }
      const drafts = await db.all<any>(
        "SELECT * FROM legal_drafts WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      res.json(drafts);
    } catch (err: any) {
      console.error("[DRAFT] getDrafts error:", err);
      res.status(500).json({ error: "Failed to load drafts." });
    }
  }
}

export const draftController = new DraftController();
