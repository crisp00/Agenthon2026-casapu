/**
 * What the speaker says, slide by slide and step by step: the teleprompter text. One string per step
 * (index 0 is the slide when it opens, then one per arrow-key press inside the slide).
 * [Square brackets] are stage directions, shown in a different colour, never read aloud.
 * Interactive slides have a single block: the cues tell you what to click.
 */
export const SCRIPT: Record<string, string[]> = {
  intro: [
    "Good morning. We're [your names], and this is Company Brain: the colleague who knows, and speaks first. We'll show it live, on a simulated company that makes pasta.",
    "It reads what a company already has: emails, news, documents. Each one is a file, and each says who may see it and how far to trust it.",
    "What comes out are claims, each tied to a verbatim quote.",
  ],
  title: [
    "Let's start simple. Pasta has two main ingredients: water, and semolina.",
    "Imagine it's the twenty-first of November, and the price of one of them has just gone up by eighteen percent.",
  ],
  morning: [
    "We're at the plant in Parma, eight fifty-eight in the morning. Nine days of semolina left.",
    "Sixty percent is covered by a contract, at four-twelve a tonne. The rest is bought at the market price.",
  ],
  company: [
    "Think of the company as a graph: each dot is a room where something is known.",
    "Finance holds the contract.",
    "Production holds the stock: nine days.",
    "Procurement holds an offer that expires on the twenty-eighth.",
    "Each room has a piece. There's no door between them, so nobody has put the numbers together.",
    "So what does a company usually do about that? It adds a door. A weekly meeting.\n\n[Small smile.] Everyone nods. Nothing is decided.",
    "Or, these days: a shared drive with a chatbot on top. It reads everything, trusts everything, and never tells you when it's guessing.",
    "[Beat.] Nope.\n\nNobody wants another meeting. And nobody trusts a bot that never says \"I don't know.\"",
  ],
  reveal: [
    "So we didn't add a door. We gave the company a brain.",
    "Company Brain. A colleague who knows what the company knows, and speaks first when it matters.",
  ],
  world: [
    "This is the company this morning, as it really is. No order exists. Stock covers nine days.\n\nRemember this panel. It's how you'll know nothing was done behind your back.\n\n[Next slide.]",
  ],
  channel: [
    "[Press E.] A market report arrives. Nobody asked anything, and the Brain writes first, in the channel the team already uses: what it found, and what it rests on.\n\nAnd read the last line: nothing has been executed. It's waiting for Marta.",
  ],
  math: [
    "Let's open that message. Where does one hundred and twenty-three thousand come from?",
    "Seventy-seven euros more per tonne, times the sixteen hundred tonnes we buy on the market each month. A hundred and twenty-three thousand, two hundred. Four months to March: four hundred and ninety-two thousand.",
    "And it proposes something: bring forward three thousand tonnes from the other mill at four-seventy. Ninety-six thousand saved. Cover goes from nine days to thirty-one.",
    "But it can't approve itself. The action waits for the two conclusions it rests on.\n\n[Next slide.]",
  ],
  memory: [
    "Now Marta decides what becomes memory. [Approve the price and the cost.] [Reject the rumour.] She rejects a rumour from an unknown source.\n\nNothing becomes memory until a person says so.",
  ],
  ask: [
    "Now ask it anything.\n\n[Click \"How much has the semolina price gone up?\"] It answers with the number and its sources. [Click a citation.] That's the exact sentence it came from.\n\n[Ask about the Canadian harvest.] \"I don't know.\" We rejected that rumour.\n\n[Ask about Turkey.] \"I don't know.\" It would rather say that than invent something.",
  ],
  who: [
    "[Ask: \"What is our framework contract price?\"] Same question, two colleagues. Luca, in finance, gets the price and its source. Sara, in production, gets: \"I don't know.\"\n\nHer agent only knows what Sara is allowed to know.",
  ],
  correction: [
    "[Press E.] Then the world changes: a correction. The eighteen percent was one local market.\n\nNothing is rewritten. The Brain flags what depended on it, and proposes lower numbers.",
  ],
  approvals: [
    "[Approve the conclusions, then the action.] Only now, after a person said yes, the order exists.\n\nTwenty-four thousand saved instead of ninety-six: still worth it, with the right numbers.",
  ],
  why: [
    "Months later, someone asks: why did we buy?\n\nOne click: the decision, who approved it, the evidence, and the versions we replaced.",
  ],
  how: [
    "[Brother speaks.] Thanks. So, how is this possible? A model reads the company's documents and proposes facts, each one tied to a quote. It never decides.",
    "Plain code then checks every claim: the quote must exist, the numbers must match. No model in the loop.",
    "A person approves. The ledger is append-only: change one row and the chain breaks.",
    "And each agent only gets the memory its person is allowed to see.\n\nThe model proposes, code verifies, a person decides. [Details on request: press B.]",
  ],
  rooms: [
    "The same story, seen from the rooms.",
    "In procurement, the Brain writes to Marta.\n\n[Press: the voice. Say nothing while it plays.]",
    "[Let it play.]",
    "In finance, Luca asks.\n\n[Read the question aloud, then press.]",
    "[Let it play.] One voice, always the Brain's.",
  ],
  impact: [
    "In this story it found three hundred and thirty-nine thousand euros of exposure before anyone asked, and saved twenty-four thousand.",
    "And it never executed anything without a person. This isn't about semolina: every company has knowledge scattered in rooms like these.\n\n[Hand over to your brother.]",
  ],
  tech: [
    "How do you trust a machine with a company's memory?",
    "You don't. You verify.\n\nLet me show you how.",
  ],
  ingest: [
    "A source enters as a file in a folder. Email, news, documents: Markdown with a strict header. It arrives now, whatever date it carries.",
    "Three kinds. Email, trusted by sender. News, trusted by domain: you can distrust a whole site. Documents, where a new version supersedes the old.",
    "Every file gets a verdict: ingested, duplicate, conflict, invalid. And a correction is never an edit. It's a new source.",
  ],
  extract: [
    "[Brother speaks.] Thanks. Let me show you what's under the hood. The model reads a document, and it doesn't summarise: it proposes atomic facts.",
    "Each fact is tied to a verbatim quote. Here: five-oh-two euros a tonne, plus eighteen percent. And it's plain code, not a model, that checks the quote is really there.",
    "Three tiers of trust. Literal values must be readable in the quote. Derived ones, like dates and units, are recomputed by code. Interpretive ones are judged by a person.",
  ],
  gate: [
    "The model can be wrong. The gate can't. It's plain code: no model, no database.",
    "Does the quote exist, exactly once? Is the number inside it? Are date, unit and currency re-derived? Then it goes to a person.",
    "If the model says five-twenty, that isn't in the quote. It bounces, and the model retries with the error.",
  ],
  ledger: [
    "Everything lands in an append-only ledger. The database itself forbids updates and deletes.",
    "One hash chain over every row. verify() re-audits the lot.",
    "Change one row and every row after it breaks. One check is enough to notice.",
  ],
  access: [
    "Access is decided before the model. A claim inherits the strictest label of the evidence under it. Marta sees everything.",
    "Luca sees public and finance.",
    "Sara sees only public. For her agent the rest of the graph doesn't exist. Not hidden: absent.",
  ],
  recompute: [
    "And every fact has a parent.",
    "Distrust a source, even after the fact, and only what depends on it is recomputed.",
    "Five conclusions and one action to review. Three nodes untouched. The blast radius is visible. [Hand back.]",
  ],
  finale: [
    "A company is what it remembers.",
    "Company Brain: the colleague who knows, and speaks first.\n\nThank you.",
  ],
};

/** Words per minute used for the time estimate. */
export const WPM = 140;
export const wordCount = (s: string) => s.replace(/\[[^\]]*\]/g, "").split(/\s+/).filter(Boolean).length;
