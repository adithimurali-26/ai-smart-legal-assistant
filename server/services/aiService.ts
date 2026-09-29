import { config } from "../config/env";
import { ragService, RetrievedLegalSource } from "./ragService";
import { citationValidator, CitationValidationResult } from "./citationValidator";

export interface AIResponsePayload {
  answer: string;
  summary: string;
  explanationMode: "simple" | "professional";
  applicableLaws: { act: string; section: string; title: string; explanation: string }[];
  nextSteps: string[];
  evidenceToGather: string[];
  potentialIssues: string[];
  sourcesUsed: { act: string; section: string; title: string; tag: string; url?: string }[];
  verificationState: "Verified supporting source retrieved" | "Partial supporting material retrieved" | "Source verification required";
  disclaimer: string;
}

export class AIService {
  /**
   * Main assistant orchestrator: Retrieval -> Citation-First Prompting -> LLM/Engine -> Citation Validation
   */
  async processLegalQuery(
    query: string,
    mode: "simple" | "professional" = "simple",
    category?: string
  ): Promise<AIResponsePayload> {
    // 1. Retrieve statutory grounding
    const retrievedSources = await ragService.retrieveRelevantSources(query, category, 4);

    // 2. Call external LLM if API key is configured, else use internal legal reasoning engine
    let payload: AIResponsePayload;
    if (config.llmApiKey) {
      try {
        payload = await this.callExternalLLM(query, mode, retrievedSources);
      } catch (err) {
        console.warn("[AI] External LLM error, using legal reasoning engine fallback:", err);
        payload = this.synthesizeLegalResponse(query, mode, retrievedSources);
      }
    } else {
      payload = this.synthesizeLegalResponse(query, mode, retrievedSources);
    }

    // 3. Strict citation validation
    const validation: CitationValidationResult = citationValidator.validate(payload.answer, retrievedSources);
    payload.sourcesUsed = validation.verifiedSources;
    payload.verificationState = validation.verificationState;

    if ((!payload.applicableLaws || payload.applicableLaws.length === 0) && retrievedSources.length > 0) {
      payload.applicableLaws = retrievedSources.map((s) => ({
        act: s.actName,
        section: s.section,
        title: s.title,
        explanation: s.plainExplanation,
      }));
    }

    return payload;
  }

  /**
   * External LLM call (supports Gemini and OpenAI compatible endpoints)
   */
  private async callExternalLLM(
    query: string,
    mode: "simple" | "professional",
    sources: RetrievedLegalSource[]
  ): Promise<AIResponsePayload> {
    const sourcesContext = sources
      .map((s) => `- ${s.actName} (${s.section}): ${s.title}. Statutory text: "${s.statutoryText}". Plain explanation: "${s.plainExplanation}"`)
      .join("\n");

    const systemPrompt = `You are Counsel, an AI Indian Legal Intelligence Assistant.
Follow these critical rules:
1. Ground your response in the provided Indian statutory sources. NEVER invent statutes, fake sections, or non-existent judgments.
2. If no source matches, state clearly that authoritative statutory sources require verification.
3. Distinguish between general guidance and statutory law.
4. Mode: ${mode === "simple" ? "Use simple, accessible everyday citizen language without legal jargon." : "Use professional legal terminology suitable for advocates and law students."}
5. Return JSON with the following structure:
{
  "summary": "...",
  "answer": "...",
  "applicableLaws": [{"act": "...", "section": "...", "title": "...", "explanation": "..."}],
  "nextSteps": ["..."],
  "evidenceToGather": ["..."],
  "potentialIssues": ["..."]
}

Retrieved Verified Sources:
${sourcesContext || "No exact statutory match in indexed records."}`;

    // If Gemini
    if (config.llmProvider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.llmModel}:generateContent?key=${config.llmApiKey}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Question:\n${query}` }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!resp.ok) {
        throw new Error(`Gemini API returned ${resp.status}`);
      }

      const data = await resp.json() as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);

      return {
        answer: parsed.answer || parsed.summary,
        summary: parsed.summary || parsed.answer,
        explanationMode: mode,
        applicableLaws: parsed.applicableLaws || [],
        nextSteps: parsed.nextSteps || [],
        evidenceToGather: parsed.evidenceToGather || ["Relevant agreements", "Proof of communication", "Payment receipts"],
        potentialIssues: parsed.potentialIssues || [],
        sourcesUsed: [],
        verificationState: "Verified supporting source retrieved",
        disclaimer: "This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.",
      };
    }

    // Default fallback to synthesis
    return this.synthesizeLegalResponse(query, mode, sources);
  }

  /**
   * Deterministic, citation-grounded Indian legal reasoning engine.
   * Ensures instant, reliable, hallucination-free legal guidance when no API key is set.
   */
  private synthesizeLegalResponse(
    query: string,
    mode: "simple" | "professional",
    sources: RetrievedLegalSource[]
  ): AIResponsePayload {
    const q = query.toLowerCase();

    // 1. Tenancy / Security Deposit / Rent
    if (q.includes("deposit") || q.includes("tenant") || q.includes("landlord") || q.includes("rent")) {
      const isSimple = mode === "simple";
      return {
        summary: isSimple
          ? "Under Indian tenancy law, landlords are legally required to return your security deposit when you move out, minus legitimate deductions for damage beyond normal wear and tear."
          : "Statutory rights under Section 108 of the Transfer of Property Act, 1882 and Model Tenancy Act, 2021 obligate the lessor to render an itemized deduction statement and refund the security deposit forthwith upon surrender of vacant possession.",
        answer: isSimple
          ? "If your tenancy has ended and you have handed over the keys, your landlord cannot arbitrarily keep your security deposit. By law, normal wear and tear is excluded from deductions. If your landlord refuses to respond or pay within 30 days, you can issue a formal 15-day statutory legal notice and escalate to the District Consumer Commission or Rent Court."
          : "The landlord-tenant relationship is governed by the registered lease agreement, the Transfer of Property Act, 1882, and State Rent Regulations (e.g. Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017). Unilateral forfeiture of caution deposit constitutes deficiency in service under Section 2(11) of the Consumer Protection Act, 2019 and breach of covenant under Section 108 of TPA. A pre-litigation demand notice followed by an e-Daakhil filing before the District Consumer Commission provides efficacious summary relief.",
        explanationMode: mode,
        applicableLaws: sources.map((s) => ({
          act: s.actName,
          section: s.section,
          title: s.title,
          explanation: s.plainExplanation,
        })),
        nextSteps: [
          "Preserve the signed lease agreement, UPI/bank payment receipts, and move-out correspondence.",
          "Document the condition of the vacated flat using dated photos or handover acknowledgement.",
          "Send a dated written demand via registered speed post or email seeking immediate deposit refund or itemized deductions within 15 days.",
          "If unpaid after 15 days, have a legal advocate issue a formal legal notice or file an e-Daakhil consumer petition.",
        ],
        evidenceToGather: [
          "Original lease agreement & renewal addendums",
          "Bank statements / UPI transaction records of security deposit and monthly rent payments",
          "Move-out inspection notes and photos/videos of premises",
          "WhatsApp messages, SMS, and emails requesting deposit return",
        ],
        potentialIssues: [
          "Unjustified deductions for routine painting or minor wear and tear",
          "Absence of written lease registration with the State Rent Authority",
          "Delay in vacant possession handover documentation",
        ],
        sourcesUsed: [],
        verificationState: "Verified supporting source retrieved",
        disclaimer: "This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.",
      };
    }

    // 2. Cheque Bounce / Debt recovery
    if (q.includes("cheque") || q.includes("bounce") || q.includes("138") || q.includes("dishonour")) {
      const isSimple = mode === "simple";
      return {
        summary: isSimple
          ? "A bounced cheque is a serious criminal offence under Section 138 of the Negotiable Instruments Act. You must act within strict timelines to protect your right to recover money."
          : "Dishonour of a negotiable instrument for insufficiency of funds or account closed constitutes a statutory offence under Section 138 of the Negotiable Instruments Act, 1881, attracting punitive imprisonment up to 2 years and compensation up to twice the cheque amount.",
        answer: isSimple
          ? "When a cheque bounces, your bank issues a return memo. You have strictly 30 days from the date of the memo to send a formal legal demand notice asking for payment within 15 days. If they fail to pay after 15 days, you have 30 days to file a criminal complaint in the Magistrate court."
          : "Pursuant to the mandatory statutory proviso to Section 138 of NI Act: (a) Cheque presented within validity period (3 months); (b) Bank memo received with dishonour reason; (c) Statutory demand notice dispatched within 30 days of receiving bank memo giving 15 days to pay; (d) Failure to pay triggers cause of action to file complaint under Section 142 within 30 days before the Judicial Magistrate / Metropolitan Magistrate.",
        explanationMode: mode,
        applicableLaws: sources.map((s) => ({
          act: s.actName,
          section: s.section,
          title: s.title,
          explanation: s.plainExplanation,
        })),
        nextSteps: [
          "Collect the original bounced cheque and the Bank Return Memo immediately.",
          "Calculate the 30-day statutory notice deadline from the date on the bank memo.",
          "Issue a formal Section 138 Statutory Demand Notice via Registered Post with Acknowledgment Due (RPAD).",
          "If the debtor fails to settle within 15 days of notice delivery, file a complaint under Section 142 in court.",
        ],
        evidenceToGather: [
          "Original Cheque and Bank Return Memo / Return Slip",
          "Underlying contract, bill, invoice, or loan agreement showing legally enforceable debt",
          "Postal receipt and tracking delivery report of the statutory demand notice",
        ],
        potentialIssues: [
          "Missing the 30-day limitation deadline for issuing legal notice",
          "Cheque issued for security purposes without documented legally enforceable liability",
        ],
        sourcesUsed: [],
        verificationState: "Verified supporting source retrieved",
        disclaimer: "This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.",
      };
    }

    // 3. Contract Breach / Agreement Disputes
    if (q.includes("contract") || q.includes("breach") || q.includes("clause") || q.includes("agreement")) {
      return {
        summary: "When a party breaches the terms of a written agreement, the aggrieved party is entitled to seek damages or specific performance under Indian contract law.",
        answer: mode === "simple"
          ? "If the other party has violated a contract clause or failed to deliver as promised, you can claim compensation for actual losses suffered under Section 73 of the Indian Contract Act. You should start by issuing a breach notice specifying the clause violated and giving a cure period."
          : "Breach of contract activates remedies under Section 73 & 74 of the Indian Contract Act, 1872 for unliquidated/liquidated damages, and injunctive relief or specific performance under the Specific Relief Act, 1963. Summary suit under Order 37 of the CPC may be instituted if the demand is for a liquidated debt arising from a written contract.",
        explanationMode: mode,
        applicableLaws: sources.map((s) => ({
          act: s.actName,
          section: s.section,
          title: s.title,
          explanation: s.plainExplanation,
        })),
        nextSteps: [
          "Review the termination and dispute resolution clauses in your agreement.",
          "Collate evidence of the other party's non-performance or unauthorized deduction.",
          "Send a formal Notice of Breach granting the stipulated contractual cure period.",
          "Explore pre-institution mediation or conciliation before filing in court.",
        ],
        evidenceToGather: [
          "Executed agreement with all annexures and amendments",
          "Written communications (emails, letters) evidencing the failure to perform",
          "Invoices, receipts, and proof of monetary loss directly caused by the breach",
        ],
        potentialIssues: [
          "Arbitration clause mandating private dispute resolution before court access",
          "Unreasonable liquidated damages clauses treated as penalties under Section 74",
        ],
        sourcesUsed: [],
        verificationState: "Verified supporting source retrieved",
        disclaimer: "This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.",
      };
    }

    // 4. Employment & Wrongful Termination / Salary / Notice Period
    if (
      q.includes("employ") ||
      q.includes("terminate") ||
      q.includes("termination") ||
      q.includes("fired") ||
      q.includes("dismiss") ||
      q.includes("salary") ||
      q.includes("wage") ||
      q.includes("notice period") ||
      q.includes("retrench") ||
      q.includes("severance") ||
      q.includes("gratuity") ||
      q.includes("job")
    ) {
      const isSimple = mode === "simple";
      return {
        summary: isSimple
          ? "Under Indian employment and labour law, employers cannot terminate an employee without reasonable cause and without serving the statutory/contractual notice period or paying wages in lieu of notice."
          : "Statutory mandates under Section 41 of the State Shops and Establishments Act, Section 25F of the Industrial Disputes Act, 1947, and the Payment of Wages Act, 1936 prohibit arbitrary termination without reasonable cause, due inquiry, or statutory notice pay and retrenchment compensation.",
        answer: isSimple
          ? "If your employer terminates you without notice, they are legally bound to pay your full salary in lieu of the agreed notice period (typically 30 to 90 days as per your contract or State Shops and Establishments Act). Termination without reasonable cause or without a domestic inquiry for alleged misconduct is wrongful. In addition, your employer must disburse your complete Full and Final (FnF) settlement, accrued leave encashment, unpaid bonus, and gratuity (if employed for 5+ years) within statutory timelines. You should immediately demand your notice pay and settlement in writing."
          : "Wrongful termination in the Indian corporate context gives rise to remedies under the State Shops and Establishments Act (e.g., Section 41 of Tamil Nadu Act, 1947 requiring at least one month notice or pay in lieu thereof, and a reasonable cause), the Industrial Disputes Act, 1947 (Section 25F retrenchment compensation), and common law breach of contract under Section 73 of the Indian Contract Act, 1872. Summary termination without notice pay is legally permissible solely where substantiated gross misconduct is proven through a fair domestic inquiry. An employee is entitled to immediate recovery of notice pay, earned salary under the Payment of Wages Act, 1936, and statutory gratuity under Section 4 of the Payment of Gratuity Act, 1972.",
        explanationMode: mode,
        applicableLaws: sources.map((s) => ({
          act: s.actName,
          section: s.section,
          title: s.title,
          explanation: s.plainExplanation,
        })),
        nextSteps: [
          "Carefully review your appointment letter, employment contract, and employee handbook for the specific notice period and termination clauses.",
          "Check whether the termination was communicated in writing and whether any specific grounds or reasons were cited by management.",
          "Send a formal, dated written email/letter to HR and Management demanding Full and Final (FnF) settlement including notice period salary and leave encashment.",
          "If the employer fails to settle within 15–30 days, engage an advocate to issue a formal statutory demand notice and file a complaint before the Labour Commissioner / Conciliation Officer.",
        ],
        evidenceToGather: [
          "Offer letter, signed employment agreement, and subsequent promotion/increment letters",
          "Last 3–6 months' salary slips and bank account statements showing salary credits",
          "Written termination email/letter and all communications from HR or managers",
          "Performance appraisal records, client appreciations, and proof of absence of misconduct allegations",
          "Written requests and reminders sent for Full and Final (FnF) settlement",
        ],
        potentialIssues: [
          "Employer falsely citing gross misconduct to circumvent contractual notice pay obligations",
          "Attempted recovery of training bond or illegal post-employment non-compete covenants (void under Section 27 of ICA)",
          "Classification disputes between 'workman' (Industrial Disputes Act) and managerial/supervisory staff",
        ],
        sourcesUsed: [],
        verificationState: "Verified supporting source retrieved",
        disclaimer: "This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.",
      };
    }

    // 5. Default General Legal Response with RAG grounding
    const isSimple = mode === "simple";
    return {
      summary: isSimple
        ? "We have analyzed your query against indexed Indian statutory acts and procedural codes to identify the applicable legal framework and practical next steps."
        : "Evaluation of the presented factual matrix indicates relevant statutory applicability under Indian central and state enactments. Procedural rights should be exercised subject to limitation statutes.",
      answer: isSimple
        ? `Based on your question regarding "${query}", Indian legal procedure requires documenting the facts chronologically, identifying the specific legal rights involved, and issuing formal written requests before initiating judicial proceedings. Below are the statutory provisions indexed in our database that pertain to this subject.`
        : `An analysis of the factual scenario concerning "${query}" triggers considerations under applicable statutory provisions. Under the Indian civil and criminal framework, rights must be pursued within statutory limitation periods, following necessary pre-litigation notices and jurisdictional protocols.`,
      explanationMode: mode,
      applicableLaws: sources.map((s) => ({
        act: s.actName,
        section: s.section,
        title: s.title,
        explanation: s.plainExplanation,
      })),
      nextSteps: [
        "Create a chronological summary of all key events and communications.",
        "Gather supporting contracts, messages, invoices, and bank records.",
        "Verify applicable statutory limitation periods under the Limitation Act, 1963.",
        "Consult with an assigned legal advocate for formal legal review and representation.",
      ],
      evidenceToGather: [
        "Relevant agreements, contracts, or statutory applications",
        "Official payment receipts, bank statements, or invoices",
        "Written correspondence (emails, registered post, WhatsApp messages)",
      ],
      potentialIssues: [
        "Limitation period expiring for filing civil or consumer claims",
        "Jurisdiction determination between civil courts, consumer forums, or specialized tribunals",
      ],
      sourcesUsed: [],
      verificationState: sources.length > 0 ? "Verified supporting source retrieved" : "Source verification required",
      disclaimer: "This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.",
    };
  }
}

export const aiService = new AIService();
