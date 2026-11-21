import type { EventName } from "./types";

export interface Slide {
  slug: string;
  title: string;
  /** Speaker prompts, toggled with N. Not for the audience. */
  notes: string[];
  /** The scenario event the presenter fires on this slide (key E). */
  event?: EventName;
  /** Extra beats inside the slide: the arrow keys walk through them before moving on. */
  steps?: number;
  /** Background video key (see videos.ts). */
  bg?: string;
  /** The interactive part of the demo: shows the role switch. Story slides are cinematic. */
  demo?: boolean;
  /** Chapter label, shown top left. */
  act?: string;
  /** Left out of the deck: not in the menu, the top bar or the walk. The page and its files stay, so it can come back by removing this. */
  hidden?: boolean;
  /** Not part of the 3-minute talk: kept for questions. Reached with the B key or the menu, never by walking forward. */
  backup?: boolean;
}

/**
 * The 3-minute talk, in order: the problem, the reveal, the proof (live), the close. Then the BACKUP slides
 * (engine, maths, extras): reached with B or the menu, never by walking forward from the end.
 */
const ALL_SLIDES: Slide[] = [
  { slug: "intro", title: "Company Brain", act: "Intro", steps: 2, bg: "wheat",
    notes: ["Name, tagline. Then the sources fly in: email, news, documents, each tagged with who may see it and how far to trust it. Then claims come out, tied to a quote. The rest of the talk is built elsewhere."] },
  // ---- the problem ------------------------------------------------------------------------------
  { slug: "title", hidden: true, backup: true, title: "Two ingredients", act: "I · The problem", steps: 1, bg: "wheat",
    notes: ["Don't start with the product. Pasta: water and semolina. Pause. Then the +18%.", "~15 s."] },
  { slug: "morning", hidden: true, backup: true, title: "Parma, 08:58", act: "I · The problem", steps: 1, bg: "mill",
    notes: ["Nine days left. Then the three facts at once. ~10 s."] },
  { slug: "company", hidden: true, backup: true, title: "Four rooms", act: "I · The problem", steps: 7,
    notes: ["Fly into finance, production, procurement. Then the two popular fixes: a meeting, a chatbot on the drive. Then: Nope. ~40 s."] },
  // ---- the reveal -------------------------------------------------------------------------------
  { slug: "reveal", hidden: true, backup: true, title: "Company Brain", act: "II · The reveal", steps: 1,
    notes: ["What if the pieces found each other? Then the name and the line. ~10 s."] },
  // ---- the proof (live) -------------------------------------------------------------------------
  { slug: "channel", hidden: true, backup: true, title: "It speaks first", act: "III · The proof", demo: true, event: "report",
    notes: ["Press E. Nobody asked. Point at: sources, 'nothing has been executed'. ~15 s."] },
  { slug: "memory", hidden: true, backup: true, title: "People curate the memory", act: "III · The proof", demo: true,
    notes: ["Approve the price and the cost, reject the rumour. ~15 s."] },
  { slug: "who", hidden: true, backup: true, title: "It knows who's asking", act: "III · The proof", demo: true,
    notes: ["Same question, Luca and Sara. Luca: price and source. Sara: 'I don't know'. ~15 s."] },
  { slug: "correction", hidden: true, backup: true, title: "Then the world changes", act: "III · The proof", demo: true, event: "correction",
    notes: ["Press E. Nothing is rewritten; what rested on the old evidence is flagged. ~12 s."] },
  { slug: "approvals", hidden: true, backup: true, title: "It only proposes", act: "III · The proof", demo: true,
    notes: ["Approve the updated conclusions and the action: only now does PO-9120 exist. ~12 s."] },
  { slug: "why", hidden: true, backup: true, title: "Why did we buy?", act: "III · The proof", demo: true,
    notes: ["One click: decision, approver, evidence, superseded versions. ~8 s."] },
  { slug: "rooms", hidden: true, backup: true, title: "One brain, four rooms", act: "III · The proof", steps: 4,
    notes: ["The same brain in the rooms, with one voice: the Brain's. Input first, voice on the click. ~20 s."] },
  // ---- the close --------------------------------------------------------------------------------
  { slug: "impact", hidden: true, backup: true, title: "What it is worth", act: "IV · What it is worth", steps: 1,
    notes: ["Numbers from the demo you just saw. Then: every company has this problem. ~12 s."] },
  { slug: "extract", hidden: true, backup: true, title: "Facts, not summaries", act: "V · Under the hood", steps: 2, notes: ["Atomic claims tied to verbatim quotes. Literal, derived, interpretive."] },
  { slug: "access", hidden: true, backup: true, title: "Access before the model", act: "V · Under the hood", steps: 2, notes: ["Policy before any model call. For Sara's agent the rest does not exist."] },
  { slug: "recompute", hidden: true, backup: true, title: "Distrust a source", act: "V · Under the hood", steps: 2, notes: ["A pure function of ledger and policy: only dependents recompute."] },
  { slug: "finale", hidden: true, backup: true, title: "The colleague who knows", act: "VI · The close", steps: 1, bg: "pasta",
    notes: ["Back to pasta. Close slowly. ~10 s."] },

  // ======================================== BACKUP ========================================
  { slug: "world", hidden: true, title: "The world, this morning", act: "Backup", demo: true, backup: true,
    notes: ["The 'before' panel: no order exists. Stock covers 9 days."] },
  { slug: "math", hidden: true, title: "Nobody had done the maths", act: "Backup", steps: 3, backup: true,
    notes: ["Where 123,200 comes from: 77 × 1,600. Then the action: €96k saved, 9 → 31 days."] },
  { slug: "ask", hidden: true, title: "Ask it anything", act: "Backup", demo: true, backup: true,
    notes: ["Cites, and admits gaps: Canada rejected, Turkey unknown."] },
  { slug: "how", hidden: true, title: "Under the hood", act: "Backup", steps: 3, backup: true,
    notes: ["HANDOVER: your brother speaks. The model proposes, code verifies, a person decides, the ledger remembers. Press B for the details if asked."] },
  { slug: "tech", hidden: true, title: "How do you trust it?", act: "Backup · The engine", steps: 1, bg: "racks", backup: true,
    notes: ["You don't. You verify."] },
  { slug: "ingest", hidden: true, title: "How a source enters", act: "Backup · The engine", steps: 2, backup: true, notes: ["A file in a folder. It only ever appends."] },
  { slug: "gate", hidden: true, title: "The gate", act: "Backup · The engine", steps: 2, backup: true, notes: ["Plain code, no model. A wrong value bounces back."] },
  { slug: "ledger", hidden: true, title: "The ledger", act: "Backup · The engine", steps: 2, backup: true, notes: ["Append-only, one hash chain, verify()."] },
  // ---- the live demo: real pages of the app, driven by hand ------------------------------------
  { slug: "live-add", title: "Add a news item", act: "Live demo · 1 of 5", backup: true,
    notes: ["Live: the New source page. Write the request, review the draft, add it. Then press the right arrow."] },
  { slug: "live-claims", title: "The claim appears", act: "Live demo · 2 of 5", backup: true,
    notes: ["Live: the Claims page. Watch the news become claims, with their quotes. Trusted by default."] },
  { slug: "live-notices", title: "People get their notices", act: "Live demo · 3 of 5", backup: true,
    notes: ["Live: the Chat. Heads-up cards appear on their own, per person. Switch identity to show who is told and who is not."] },
  { slug: "live-reject", title: "Reject the news", act: "Live demo · 4 of 5", backup: true,
    notes: ["Live: back to Claims, as the curator. Reject the news claim."] },
  { slug: "live-ask", title: "Ask the memory", act: "Live demo · 5 of 5", backup: true,
    notes: ["Live: the Chat again. The notices built on it show as cancelled or updated. Ask questions; the rejected claim is gone."] },

  { slug: "ideas", title: "Three ideas worth stealing", act: "Backup · Ideas", steps: 2, backup: true,
    notes: ["For questions on the technology. One at a time: atomic claims with evidence and the interpretation fenced to one tier; the immutable store that can be regenerated, with policy applied at read time; the deterministic gate. Be straight that cascading recompute is not built yet."] },
  { slug: "scope", title: "Real, staged, missing", act: "Backup · Scope", steps: 2, backup: true,
    notes: ["Be straight. Green: the live app. Amber: the story slides are a scripted engine. Red: derived claims, recompute, real connectors and login."] },
];

/** The slides in the deck: everything not hidden. */
export const SLIDES: Slide[] = ALL_SLIDES.filter((s) => !s.hidden);

export const slideIndex = (slug: string) => SLIDES.findIndex((s) => s.slug === slug);
/** Slides in the talk itself (the backup ones come after). */
export const MAIN_COUNT = SLIDES.filter((s) => !s.backup).length;
