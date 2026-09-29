import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export class DocumentExtractor {
  async extractText(filePath: string, mimeType: string = "", originalName: string = ""): Promise<string> {
    const ext = path.extname(originalName || filePath).toLowerCase();

    // 1. Plain text
    if (mimeType.includes("text") || ext === ".txt") {
      try {
        return fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        console.error("[EXTRACTOR] Error reading text file:", err);
        return "";
      }
    }

    // 2. PDF
    if (mimeType.includes("pdf") || ext === ".pdf") {
      try {
        const buffer = fs.readFileSync(filePath);
        const parser: any = new PDFParse({ data: buffer });
        if (typeof parser.load === "function") {
          await parser.load();
        }
        const res = await parser.getText();
        const text = typeof res === "string" ? res : (res?.text || "");
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err) {
        console.error("[EXTRACTOR] Error extracting PDF text:", err);
      }
    }

    // 3. Word Document (.docx)
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      ext === ".docx" ||
      ext === ".doc"
    ) {
      try {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        if (result && result.value) {
          return result.value.trim();
        }
      } catch (err) {
        console.error("[EXTRACTOR] Error extracting DOCX text:", err);
      }
    }

    // Fallback: try reading as utf-8 text
    try {
      const fallback = fs.readFileSync(filePath, "utf-8");
      if (fallback && fallback.trim().length > 20) {
        return fallback.trim();
      }
    } catch {
      // binary file or read failure
    }

    return "";
  }
}

export const documentExtractor = new DocumentExtractor();
