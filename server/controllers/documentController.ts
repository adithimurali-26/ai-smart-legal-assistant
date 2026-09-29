import { Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { AuthRequest } from "../middleware/auth";
import { config } from "../config/env";
import { db } from "../models/db";
import { documentIntelligenceService } from "../services/documentIntelligenceService";
import { documentExtractor } from "../services/documentExtractor";

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt", ".doc"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes("pdf") || file.mimetype.includes("text")) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file."));
    }
  },
});

export class DocumentController {
  async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No document file uploaded." });
        return;
      }

      const userId = req.user?.id || "usr-1790660762277-pqn7h";
      const file = req.file;
      const docId = `doc-${Date.now()}`;
      const now = new Date().toISOString();

      // Dynamically extract real text from PDF, DOCX, TXT, or documents
      const extractedText = await documentExtractor.extractText(file.path, file.mimetype, file.originalname);

      // Run Document Intelligence Pipeline
      const analysis = await documentIntelligenceService.analyzeDocument(file.originalname, extractedText);

      // Save document to DB
      await db.run(
        `INSERT INTO documents (id, user_id, filename, original_name, mime_type, size_bytes, file_path, extracted_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [docId, userId, file.filename, file.originalname, file.mimetype, file.size, file.path, extractedText, now]
      );

      // Save structured analysis
      const analysisId = `ana-${Date.now()}`;
      await db.run(
        `INSERT INTO document_analyses (id, document_id, document_type, summary, parties, important_dates, financial_amounts, obligations, termination_conditions, deadlines, risky_clauses, missing_clauses, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          analysisId,
          docId,
          analysis.documentType,
          analysis.summary,
          JSON.stringify(analysis.parties),
          JSON.stringify(analysis.importantDates),
          JSON.stringify(analysis.financialAmounts),
          JSON.stringify(analysis.obligations),
          JSON.stringify(analysis.terminationConditions),
          JSON.stringify(analysis.deadlines),
          JSON.stringify(analysis.riskyClauses),
          JSON.stringify(analysis.missingClauses),
          now,
        ]
      );

      res.status(201).json({
        document: {
          id: docId,
          originalName: file.originalname,
          sizeBytes: file.size,
          createdAt: now,
        },
        analysis,
      });
    } catch (err: any) {
      console.error("[DOC] upload error:", err);
      res.status(500).json({ error: "Failed to upload and analyze document." });
    }
  }

  async getDocuments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const docs = userId
        ? await db.all<any>(
            `SELECT d.*, a.document_type, a.summary
             FROM documents d
             LEFT JOIN document_analyses a ON a.document_id = d.id
             WHERE d.user_id = ?
             ORDER BY d.created_at DESC`,
            [userId]
          )
        : await db.all<any>(
            `SELECT d.*, a.document_type, a.summary
             FROM documents d
             LEFT JOIN document_analyses a ON a.document_id = d.id
             ORDER BY d.created_at DESC
             LIMIT 10`
          );
      res.json(docs);
    } catch (err: any) {
      console.error("[DOC] getDocuments error:", err);
      res.status(500).json({ error: "Failed to retrieve documents." });
    }
  }

  async getDocumentAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await db.get("SELECT * FROM documents WHERE id = ?", [id]);
      if (!doc) {
        res.status(404).json({ error: "Document not found." });
        return;
      }

      const analysis = await db.get("SELECT * FROM document_analyses WHERE document_id = ?", [id]);
      if (!analysis) {
        res.status(404).json({ error: "Analysis not found for this document." });
        return;
      }

      res.json({
        document: doc,
        analysis: {
          ...analysis,
          parties: JSON.parse(analysis.parties),
          importantDates: JSON.parse(analysis.important_dates),
          financialAmounts: JSON.parse(analysis.financial_amounts),
          obligations: JSON.parse(analysis.obligations),
          terminationConditions: JSON.parse(analysis.termination_conditions),
          deadlines: JSON.parse(analysis.deadlines),
          riskyClauses: JSON.parse(analysis.risky_clauses),
          missingClauses: JSON.parse(analysis.missing_clauses),
        },
      });
    } catch (err: any) {
      console.error("[DOC] getDocumentAnalysis error:", err);
      res.status(500).json({ error: "Failed to fetch document analysis." });
    }
  }
}

export const documentController = new DocumentController();
