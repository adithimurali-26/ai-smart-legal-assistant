import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../models/db";
import { aiService } from "../services/aiService";

export class ChatController {
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.json([]);
        return;
      }
      const conversations = await db.all<any>(
        "SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
        [userId]
      );
      res.json(conversations);
    } catch (err: any) {
      console.error("[CHAT] getConversations error:", err);
      res.status(500).json({ error: "Failed to load conversations." });
    }
  }

  async createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Authentication required to create conversations" });
        return;
      }
      const { title = "New Legal Thread", category = "General" } = req.body;
      const id = `conv-${Date.now()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO conversations (id, user_id, title, category, preview, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, title, category, "New conversation started...", now, now]
      );

      const conv = await db.get("SELECT * FROM conversations WHERE id = ?", [id]);
      res.status(201).json(conv);
    } catch (err: any) {
      console.error("[CHAT] createConversation error:", err);
      res.status(500).json({ error: "Failed to create conversation." });
    }
  }

  async getConversationMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = await db.get("SELECT * FROM conversations WHERE id = ?", [id]);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      const messages = await db.all<any>(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        [id]
      );

      const parsed = messages.map((m) => ({
        ...m,
        structured_analysis: m.structured_analysis ? JSON.parse(m.structured_analysis) : null,
        sources_used: m.sources_used ? JSON.parse(m.sources_used) : [],
      }));

      res.json({ conversation, messages: parsed });
    } catch (err: any) {
      console.error("[CHAT] getConversationMessages error:", err);
      res.status(500).json({ error: "Failed to load messages." });
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content, explanationMode = "simple", category } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ error: "Message content cannot be empty." });
        return;
      }

      const conversation = await db.get<any>("SELECT * FROM conversations WHERE id = ?", [id]);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      const now = new Date().toISOString();
      const userMsgId = `msg-user-${Date.now()}`;

      // 1. Insert user message
      await db.run(
        `INSERT INTO messages (id, conversation_id, sender, content, explanation_mode, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userMsgId, id, "user", content.trim(), explanationMode, now]
      );

      // 2. Run Legal AI pipeline (RAG -> Citations -> Structured Response)
      const aiResponse = await aiService.processLegalQuery(
        content.trim(),
        explanationMode,
        category || conversation.category
      );

      const aiMsgId = `msg-ai-${Date.now()}`;
      await db.run(
        `INSERT INTO messages (id, conversation_id, sender, content, explanation_mode, structured_analysis, sources_used, verification_state, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          aiMsgId,
          id,
          "assistant",
          aiResponse.answer,
          explanationMode,
          JSON.stringify({
            summary: aiResponse.summary,
            applicableLaws: aiResponse.applicableLaws,
            nextSteps: aiResponse.nextSteps,
            evidenceToGather: aiResponse.evidenceToGather,
            potentialIssues: aiResponse.potentialIssues,
          }),
          JSON.stringify(aiResponse.sourcesUsed),
          aiResponse.verificationState,
          new Date().toISOString(),
        ]
      );

      // 3. Update conversation preview & title if it's the first question
      const previewText = content.length > 60 ? content.substring(0, 57) + "…" : content;
      await db.run(
        `UPDATE conversations SET preview = ?, updated_at = ? WHERE id = ?`,
        [previewText, new Date().toISOString(), id]
      );

      res.status(201).json({
        userMessage: { id: userMsgId, sender: "user", content, created_at: now },
        aiResponse: {
          id: aiMsgId,
          sender: "assistant",
          content: aiResponse.answer,
          explanationMode,
          structured_analysis: {
            summary: aiResponse.summary,
            applicableLaws: aiResponse.applicableLaws,
            nextSteps: aiResponse.nextSteps,
            evidenceToGather: aiResponse.evidenceToGather,
            potentialIssues: aiResponse.potentialIssues,
          },
          sources_used: aiResponse.sourcesUsed,
          verification_state: aiResponse.verificationState,
          disclaimer: aiResponse.disclaimer,
          created_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error("[CHAT] sendMessage error:", err);
      res.status(500).json({ error: "Failed to process legal query." });
    }
  }
}

export const chatController = new ChatController();
