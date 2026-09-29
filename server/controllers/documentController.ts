import { Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { AuthRequest } from "../middleware/auth";
import { config } from "../config/env";
import { db } from "../models/db";
import { documentIntelligenceService } from "../services/documentIntelligenceService";
import { documentExtractor } from "../services/documentExtractor";
import { ragService } from "../services/ragService";

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
  private async resolveRelatedLawsAndAdvocate(docType: string, summary: string, riskyClauses: any[], filename: string) {
    // 1. Related Laws via RAG
    const queryWords = [
      docType || "",
      summary || "",
      filename || "",
      ...(riskyClauses || []).map((r: any) => `${r.clause || ""} ${r.explanation || ""}`)
    ].join(" ");

    const sources = await ragService.retrieveRelevantSources(queryWords, undefined, 4);
    const relatedLaws = sources.map((s) => ({
      id: s.id,
      act: s.actName,
      section: s.section,
      title: s.title,
      explanation: s.plainExplanation,
      statutoryText: s.statutoryText,
      tag: s.category || "Primary source",
      verified: s.verified,
    }));

    // 2. Assigned Advocate matching document domain
    const advisors = await db.all<any>("SELECT * FROM legal_advisors ORDER BY rating DESC");
    const parsedAdvisors = advisors.map((a) => ({
      ...a,
      specialties: a.specialties ? (typeof a.specialties === "string" ? JSON.parse(a.specialties) : a.specialties) : [],
      barNo: a.bar_no,
    }));

    const lowerContext = `${docType} ${summary} ${filename}`.toLowerCase();
    let assignedAdvocate = parsedAdvisors.find((a) =>
      a.specialties?.some((sp: string) =>
        lowerContext.includes(sp.toLowerCase()) || sp.toLowerCase().split(" ").some((w: string) => w.length > 3 && lowerContext.includes(w))
      )
    ) || parsedAdvisors[0] || null;

    return { relatedLaws, assignedAdvocate };
  }

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

      // Resolve Related Laws & Assigned Advocate
      const { relatedLaws, assignedAdvocate } = await this.resolveRelatedLawsAndAdvocate(
        analysis.documentType,
        analysis.summary,
        analysis.riskyClauses,
        file.originalname
      );

      // Save document to DB
      await db.run(
        `INSERT INTO documents (id, user_id, filename, original_name, mime_type, size_bytes, file_path, extracted_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [docId, userId, file.filename, file.originalname, file.mimetype, file.size, file.path, extractedText, now]
      );

      // Save structured analysis
      const analysisId = `ana-${Date.now()}`;
      await db.run(
        `INSERT INTO document_analyses (id, document_id, document_type, summary, parties, important_dates, financial_amounts, obligations, termination_conditions, deadlines, risky_clauses, missing_clauses, related_laws, assigned_advocate_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          JSON.stringify(relatedLaws),
          assignedAdvocate ? assignedAdvocate.id : null,
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
        relatedLaws,
        assignedAdvocate,
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
      const doc = await db.get<any>("SELECT * FROM documents WHERE id = ?", [id]);
      if (!doc) {
        res.status(404).json({ error: "Document not found." });
        return;
      }

      const analysis = await db.get<any>("SELECT * FROM document_analyses WHERE document_id = ?", [id]);
      if (!analysis) {
        res.status(404).json({ error: "Analysis not found for this document." });
        return;
      }

      let relatedLaws = analysis.related_laws ? (typeof analysis.related_laws === "string" ? JSON.parse(analysis.related_laws) : analysis.related_laws) : null;
      let assignedAdvocate = null;

      if (analysis.assigned_advocate_id) {
        const adv = await db.get<any>("SELECT * FROM legal_advisors WHERE id = ?", [analysis.assigned_advocate_id]);
        if (adv) {
          assignedAdvocate = {
            ...adv,
            specialties: adv.specialties ? (typeof adv.specialties === "string" ? JSON.parse(adv.specialties) : adv.specialties) : [],
            barNo: adv.bar_no,
          };
        }
      }

      const riskyParsed = typeof analysis.risky_clauses === "string" ? JSON.parse(analysis.risky_clauses) : (analysis.risky_clauses || []);

      if (!relatedLaws || !assignedAdvocate) {
        const resolved = await this.resolveRelatedLawsAndAdvocate(
          analysis.document_type,
          analysis.summary,
          riskyParsed,
          doc.original_name
        );
        if (!relatedLaws) relatedLaws = resolved.relatedLaws;
        if (!assignedAdvocate) assignedAdvocate = resolved.assignedAdvocate;
      }

      res.json({
        document: doc,
        analysis: {
          ...analysis,
          documentType: analysis.document_type,
          parties: typeof analysis.parties === "string" ? JSON.parse(analysis.parties) : analysis.parties,
          importantDates: typeof analysis.important_dates === "string" ? JSON.parse(analysis.important_dates) : analysis.important_dates,
          financialAmounts: typeof analysis.financial_amounts === "string" ? JSON.parse(analysis.financial_amounts) : analysis.financial_amounts,
          obligations: typeof analysis.obligations === "string" ? JSON.parse(analysis.obligations) : analysis.obligations,
          terminationConditions: typeof analysis.termination_conditions === "string" ? JSON.parse(analysis.termination_conditions) : analysis.termination_conditions,
          deadlines: typeof analysis.deadlines === "string" ? JSON.parse(analysis.deadlines) : analysis.deadlines,
          riskyClauses: riskyParsed,
          missingClauses: typeof analysis.missing_clauses === "string" ? JSON.parse(analysis.missing_clauses) : analysis.missing_clauses,
        },
        relatedLaws,
        assignedAdvocate,
      });
    } catch (err: any) {
      console.error("[DOC] getDocumentAnalysis error:", err);
      res.status(500).json({ error: "Failed to fetch document analysis." });
    }
  }
}

export const documentController = new DocumentController();

