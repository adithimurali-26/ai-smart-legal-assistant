import { db } from "../models/db";

export interface RetrievedLegalSource {
  id: string;
  actName: string;
  section: string;
  title: string;
  chapter?: string;
  category: string;
  jurisdiction: string;
  year?: number;
  statutoryText: string;
  plainExplanation: string;
  sourceUrl?: string;
  verified: boolean;
  effectiveDate?: string;
  score: number;
}

export class LegalRAGService {
  /**
   * Retrieves verified statutory sections matching query terms, section numbers, or legal issues.
   */
  async retrieveRelevantSources(query: string, category?: string, limit: number = 4): Promise<RetrievedLegalSource[]> {
    const allSources = await db.all<{
      id: string;
      act_name: string;
      section: string;
      title: string;
      chapter: string | null;
      category: string;
      jurisdiction: string;
      year: number | null;
      statutory_text: string;
      plain_explanation: string;
      keywords: string;
      source_url: string | null;
      verified: number;
      effective_date: string | null;
    }>("SELECT * FROM legal_sources");

    const STOP_WORDS = new Set([
      "can", "could", "would", "should", "will", "shall", "may", "might", "must",
      "what", "when", "where", "which", "who", "whom", "whose", "why", "how",
      "the", "and", "or", "but", "if", "then", "else", "for", "with", "without",
      "about", "against", "between", "into", "through", "during", "before", "after",
      "above", "below", "from", "up", "down", "in", "out", "on", "off", "over", "under",
      "again", "further", "once", "here", "there", "all", "any", "both", "each",
      "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
      "same", "so", "than", "too", "very", "have", "has", "had", "having", "do", "does",
      "did", "doing", "be", "is", "am", "are", "was", "were", "been", "being", "my", "me",
      "mine", "you", "your", "yours", "he", "him", "his", "she", "her", "hers", "it", "its",
      "we", "us", "our", "ours", "they", "them", "their", "theirs", "tell", "about", "give",
      "explain", "rights", "under", "law", "indian"
    ]);

    const cleanQuery = query.toLowerCase().trim();
    const queryWords = cleanQuery
      .split(/[\s,.;:?!]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    // Look for explicit section numbers like "section 138", "108", "318", "order 37"
    const sectionMatch = cleanQuery.match(/(?:section|sec|order)\s*([0-9a-z\s]+)/i);
    const targetSection = sectionMatch ? sectionMatch[1].trim() : null;

    const scored = allSources
      .map((s) => {
        let score = 0;
        const keywords: string[] = s.keywords ? JSON.parse(s.keywords) : [];
        const fullContent = `${s.act_name} ${s.section} ${s.title} ${s.plain_explanation} ${s.statutory_text} ${keywords.join(" ")}`.toLowerCase();

        // Exact section number match (huge boost)
        if (targetSection && s.section.toLowerCase().includes(targetSection)) {
          score += 150;
        }

        // Exact phrase match
        if (cleanQuery.length > 8 && fullContent.includes(cleanQuery)) {
          score += 80;
        }

        // Act name match
        if (cleanQuery.includes(s.act_name.toLowerCase()) || s.act_name.toLowerCase().includes(cleanQuery)) {
          score += 50;
        }

        // Keywords match
        for (const kw of keywords) {
          if (cleanQuery.includes(kw.toLowerCase())) {
            score += 40;
          }
        }

        // Meaningful word hits
        for (const word of queryWords) {
          if (s.section.toLowerCase().includes(word)) score += 25;
          if (keywords.some((k) => k.toLowerCase().includes(word))) score += 20;
          if (s.title.toLowerCase().includes(word)) score += 15;
          if (s.plain_explanation.toLowerCase().includes(word)) score += 8;
          if (s.statutory_text.toLowerCase().includes(word)) score += 3;
        }

        // Category filter penalty/bonus
        if (category && category !== "All") {
          const statutoryCategories = ["criminal law", "civil law", "family law", "commercial law", "tamil nadu laws"];
          if (statutoryCategories.includes(category.toLowerCase())) {
            if (s.category.toLowerCase() === category.toLowerCase()) {
              score += 30;
            } else if (!targetSection) {
              score = 0;
            }
          } else {
            // Topic tag like "Housing", "Contracts", "Employment"
            if (fullContent.includes(category.toLowerCase())) {
              score += 25;
            }
          }
        }

        return {
          id: s.id,
          actName: s.act_name,
          section: s.section,
          title: s.title,
          chapter: s.chapter || undefined,
          category: s.category,
          jurisdiction: s.jurisdiction,
          year: s.year || undefined,
          statutoryText: s.statutory_text,
          plainExplanation: s.plain_explanation,
          sourceUrl: s.source_url || undefined,
          verified: Boolean(s.verified),
          effectiveDate: s.effective_date || undefined,
          score,
        };
      })
      .filter((s) => s.score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  /**
   * Search legal catalogue for the search page with filtering and metadata.
   */
  async searchCatalogue(query: string, category?: string): Promise<RetrievedLegalSource[]> {
    if (!query && (!category || category === "All")) {
      const all = await db.all<any>("SELECT * FROM legal_sources ORDER BY act_name ASC, section ASC");
      return all.map((s) => ({
        id: s.id,
        actName: s.act_name,
        section: s.section,
        title: s.title,
        chapter: s.chapter || undefined,
        category: s.category,
        jurisdiction: s.jurisdiction,
        year: s.year || undefined,
        statutoryText: s.statutory_text,
        plainExplanation: s.plain_explanation,
        sourceUrl: s.source_url || undefined,
        verified: Boolean(s.verified),
        effectiveDate: s.effective_date || undefined,
        score: 1,
      }));
    }

    return this.retrieveRelevantSources(query || category || "", category, 50);
  }
}

export const ragService = new LegalRAGService();
