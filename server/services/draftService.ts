export interface LegalDraftInput {
  draftType: "legal_notice" | "complaint" | "reply" | "agreement" | "representation" | "affidavit";
  parties: {
    senderName: string;
    senderAddress: string;
    recipientName: string;
    recipientAddress: string;
  };
  facts: string;
  amountClaimed?: string;
  demandedRelief: string;
  cureDays?: number;
}

export class DraftService {
  /**
   * Generates a formal, professionally drafted Indian legal document template
   */
  generateDraft(input: LegalDraftInput): { title: string; content: string } {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const cureDays = input.cureDays || 15;

    if (input.draftType === "legal_notice") {
      const title = `STATUTORY LEGAL NOTICE UNDER SECTION 108 OF TRANSFER OF PROPERTY ACT & INDIAN CONTRACT ACT`;
      const content = `REGISTERED POST WITH ACKNOWLEDGEMENT DUE / SPEED POST

Date: ${today}

To,
${input.parties.recipientName}
${input.parties.recipientAddress}

From,
${input.parties.senderName}
${input.parties.senderAddress}

SUBJECT: STATUTORY LEGAL NOTICE FOR IMMEDIATE REFUND OF SECURITY CAUTION DEPOSIT OF ${input.amountClaimed || "₹60,000/-"} ALONG WITH ACCRUED INTEREST.

Sir / Madam,

Under instructions from and on behalf of my client / the undersigned, ${input.parties.senderName}, I hereby serve upon you this Statutory Legal Demand Notice as under:

1. That you, the Noticee, are the lawful owner/landlord of the residential premises situated at ${input.parties.recipientAddress}.

2. That an Agreement was executed between the parties, pursuant to which my client was inducted as a tenant and paid a sum of ${input.amountClaimed || "₹60,000/-"} towards interest-free refundable security caution deposit.

3. That my client lawfully vacated the premises on the agreed date, peacefully handed over vacant possession and keys thereof, without any rent or utility arrears outstanding.

4. That despite oral and written demands, you have unlawfully, willfully, and dishonestly withheld the refundable deposit in flagrant violation of the terms of the tenancy and Section 108 of the Transfer of Property Act, 1882.

5. That your conduct amounts to deficiency in service under the Consumer Protection Act, 2019 and breach of trust.

NOW THEREFORE, YOU ARE HEREBY CALLED UPON TO:
Pay and refund to the undersigned the full security deposit sum of ${input.amountClaimed || "₹60,000/-"} along with interest at 18% per annum from the date of handover within ${cureDays} (FIFTEEN) DAYS of the receipt of this notice, failing which my client shall be constrained to initiate appropriate civil, consumer, and criminal proceedings against you before the competent Court of Law entirely at your own risk, cost, and consequence.

Copy preserved for production before the Court.

Yours faithfully,

${input.parties.senderName}
(Complainant / Aggrieved Tenant)`;

      return { title, content };
    }

    if (input.draftType === "complaint") {
      const title = `CONSUMER COMPLAINT BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION`;
      const content = `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
AT CHENNAI, TAMIL NADU

CONSUMER COMPLAINT NO. _____ OF ${new Date().getFullYear()}

IN THE MATTER OF:
${input.parties.senderName}
Residing at: ${input.parties.senderAddress}
... COMPLAINANT

VERSUS

${input.parties.recipientName}
Residing at: ${input.parties.recipientAddress}
... OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE AND UNFAIR TRADE PRACTICE

MOST RESPECTFULLY SHOWETH:

1. That the Complainant is a consumer within the meaning of Section 2(7) of the Consumer Protection Act, 2019.
2. Facts of the Case:
${input.facts || "The Complainant engaged the services of the Opposite Party and made statutory deposits. The Opposite Party wrongfully failed to discharge obligations."}
3. That the cause of action arose on ${today} when the Opposite Party failed to comply with the legal demand notice.

PRAYER:
Wherefore, it is most respectfully prayed that this Hon'ble Commission may be pleased to:
a) Direct the Opposite Party to refund the sum of ${input.amountClaimed || "₹60,000/-"} with 12% interest;
b) Award compensation of ₹25,000 towards mental agony and harassment;
c) Award litigation costs of ₹10,000;
d) Pass such other and further orders as this Hon'ble Commission may deem fit and proper in the interest of justice.

Complainant: ${input.parties.senderName}
Through Legal Counsel`;

      return { title, content };
    }

    // Default basic affidavit draft
    const title = `AFFIDAVIT IN SUPPORT OF STATEMENT OF FACTS`;
    const content = `AFFIDAVIT
BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE

I, ${input.parties.senderName}, aged about __ years, residing at ${input.parties.senderAddress}, do hereby solemnly affirm and state on oath as follows:

1. That I am the Deponent herein and fully conversant with the facts deposed herein below.
2. That: ${input.facts || "The statements made in the accompanying representation are true to my personal knowledge and belief."}
3. That no material particulars have been concealed therefrom.

DEPONENT

VERIFICATION:
Verified at on this ${today} that the contents of above affidavit are true and correct to my knowledge.
DEPONENT`;

    return { title, content };
  }
}

export const draftService = new DraftService();
