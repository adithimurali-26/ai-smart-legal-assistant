# AI Smart Legal Assistant — Design Direction

## Three Stylistic Approaches

### Theme Name: Civic Ledger
Very light editorial legal-tech: warm paper, ink, cobalt annotations, and document-inspired structure. It feels transparent, calm, and grounded in public-service trust.

**Probability:** 0.04

### Theme Name: Midnight Counsel
A dark, cinematic research workspace with restrained electric blue highlights and glass-like source panels. It feels precise, focused, and built for deep work.

**Probability:** 0.07

### Theme Name: Verdigris Brief
A premium editorial system that pairs deep ink navy with oxidized teal, parchment neutrals, and copper signals. It balances institutional authority with humane clarity and avoids the visual language of a generic chatbot.

**Probability:** 0.02

## Selected Direction: Verdigris Brief

### Design Movement
Contemporary editorial modernism, borrowing from legal briefs, archival indexes, and Swiss information design while softening the system with a humanist digital palette.

### Core Principles
1. **Evidence before spectacle:** sources, dates, and confidence context are visually prioritized over decorative AI theatrics.
2. **Editorial rhythm:** asymmetric columns, rule lines, marginal labels, and generous negative space make complex information easy to scan.
3. **Human-readable by default:** plain-language explanations, restrained hierarchy, and familiar interaction patterns serve non-technical users.
4. **Quiet confidence:** motion, color, and material depth are used sparingly so the interface feels trustworthy rather than promotional.

### Color Philosophy
The foundation is deep ink navy, chosen for the seriousness and legibility of legal work. Oxidized teal is the ownable signal color: it implies clarity, restoration, and knowledge in motion. Warm parchment provides relief from sterile white interfaces, while copper is reserved for provenance, saved items, and small moments of emphasis. The palette should feel like a well-kept archive translated into a modern product.

### Layout Paradigm
Use a persistent editorial rail rather than a conventional centered dashboard. The landing page uses an offset hero with a large typographic column and a floating legal-index artifact. Product pages use a two-tier rail: compact identity/navigation on the left and content canvases that open toward the right. Dense information should be split into a primary reading column and an evidence/margin column.

### Signature Elements
- Thin copper rules and numbered marginal labels inspired by annotated briefs.
- A small circular “seal” mark combining a split column and an open bracket.
- Parchment-toned index cards with teal source tabs and monospaced metadata.

### Interaction Philosophy
Every action should make the system feel more legible: hover states reveal provenance, tabs behave like tabs in a file, saves feel like filing a document, and loading states describe what the assistant is doing rather than using an abstract spinner alone. Buttons should be decisive and modest, with tactile press feedback.

### Animation
Entrance motion is a short editorial reveal: opacity plus a 10–16px upward shift, staggered by 45ms across cards. Source panels slide in from the margin at 220ms with a strong ease-out. Loading uses a pulsing teal rule and changing process labels, not a decorative endless spinner. Hover states transition within 160ms. Respect reduced-motion preferences and disable non-essential reveals.

### Typography System
Use **DM Serif Display** for major headlines and section titles, **Manrope** for interface/body copy, and **IBM Plex Mono** for metadata, source labels, dates, and confidence context. Headlines are compact and slightly editorial; body copy uses 1.55 line-height; metadata is uppercase with generous tracking. Never use Inter.

### Brand Essence
An evidence-aware legal information companion for people who need to understand the next step without losing the human context. Personality: **clear, grounded, quietly exacting**.

### Brand Voice
Headlines are direct and reassuring without making legal promises. CTAs use active verbs and describe the user's outcome. Microcopy names uncertainty plainly and treats the user with respect.

Example lines:
- “Start with the question. We’ll help you find the record.”
- “AI-assisted information, with the source trail kept in view.”

### Wordmark & Logo
The mark is a bold circular seal made from two offset vertical brackets that form an open book and a subtle “A” aperture in negative space. The wordmark should be set in a custom-feeling serif lockup with a small monospaced “LEGAL INTELLIGENCE” descriptor; the symbol must also work independently as the favicon.

### Signature Brand Color
**Verdigris Teal — #1D7A78.** Use it for primary actions, active navigation, source tabs, and progress signals. It should be recognizable without becoming a neon accent.

## Implementation Notes

The first delivery will emphasize a polished landing page plus a fully navigable dashboard shell and representative AI assistant, search, document analysis, history, saved, and settings views using realistic mock data. API service boundaries will be represented in a small client-side service module so a future FastAPI backend can replace the mock layer without changing page composition. Legal content will be framed as general informational material, never as definitive legal advice.

## Style Decisions

- Copper is reserved for provenance, saved or recorded states, caution and disclaimer moments, and thin rule accents; primary actions and active navigation remain Verdigris Teal #1D7A78.
- App pages avoid abstract AI glow and orb motifs; intelligence is expressed through indexed documents, source trails, bracket geometry, ledger metadata, and evidence columns.
- Every workspace view includes at least one explicit legal-index cue: a numbered marginal label, monospaced docket metadata, a teal source tab, or a copper provenance rule.

## Reference Revision: Ground-Truth Theme

The supplied reference image overrides the previous Verdigris Brief palette for this revision. Use Vanilla Custard **#FFF9EB** as the warm base, Misty Sage **#9FB2AC** as the calm structural field, and Bloodstone **#5D0D18** as the strong legal-action and emphasis color. Translate the reference's large organic, liquid-like overlapping blobs into CSS background shapes and soft section silhouettes. Keep typography readable and professional, but let the palette and irregular forms feel more welcoming and less institutional.

The primary user flow is: landing page → Explore capabilities → dedicated capabilities page → role selection → user or legal advisor login. A legal advisor's workspace is a case queue for user queries requiring advisor action, with visible court, hearing year, requested intervention, status, and a case-detail action for accepting or recording hearing follow-up.
