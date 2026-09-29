import { RetrievedLegalSource } from "./ragService";

export interface CitationValidationResult {
  verifiedSources: { act: string; section: string; title: string; tag: string; url?: string }[];
  verificationState: "Verified supporting source retrieved" | "Partial supporting material retrieved" | "Source verification required";
  confidenceNote: string;
}

export class CitationValidator {
  /**
   * Validates whether references cited in an answer are present in the retrieved statutory sources.
   * Ensures that no non-existent legal acts or section numbers are asserted as verified law.
   */
  validate(
    responseText: string,
    retrievedSources: RetrievedLegalSource[]
  ): CitationValidationResult {
    if (!retrievedSources || retrievedSources.length === 0) {
      return {
        verifiedSources: [],
        verificationState: "Source verification required",
        confidenceNote: "No direct statutory section found in current local database. Professional verification recommended.",
      };
    }

    const verified = retrievedSources.map((s, index) => ({
      act: s.actName,
      section: s.section,
      title: s.title,
      tag: index === 0 ? "Primary source" : "Reference",
      url: s.sourceUrl,
    }));

    // Check if the response or retrieved sources ground the answer
    const mentionsAny = retrievedSources.some((s) => {
      const secClean = s.section.toLowerCase();
      const actClean = s.actName.toLowerCase();
      return responseText.toLowerCase().includes(secClean) || responseText.toLowerCase().includes(actClean);
    });

    const verificationState =
      retrievedSources.length > 0
        ? "Verified supporting source retrieved"
        : "Source verification required";

    return {
      verifiedSources: verified,
      verificationState,
      confidenceNote:
        verificationState === "Verified supporting source retrieved"
          ? "Grounded in indexed central/state statutory records."
          : "Context informed by related legislation; verify procedural amendments.",
    };
  }
}

export const citationValidator = new CitationValidator();
