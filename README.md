# Company Brain

The colleague who knows, and speaks first. A shared team memory that people curate, with every fact tied to a verbatim quote, and a per-person agent that tells you what needs your attention.

**Hackathon track:** Challenge A. The demo (3 min) must show: it speaks first · people curate the memory · it knows who's asking · it cites · it admits gaps · it only proposes actions · it fits the team's day.

## Core ideas

- **Atomic claims, grounded in quotes.** Every claim carries a verbatim quote from an immutable source. A deterministic gate checks the quote and every literal value before anything is stored.
- **Model error is fenced.** Fields come in three tiers:
  - *literal*: must be readable from the quote (checked mechanically)
  - *resolved*: re-derived by a deterministic resolver (dates, units, currency)
  - *interpretive*: reviewed by a human curator
- **Immutable, verifiable store.** Append-only tables, one global hash chain, and `verify()` re-audits everything.
- **Derived state is a pure function of (log, policy).** Distrust a source retroactively and everything downstream recomputes, with a visible blast radius.
- **Proactivity is a query, not a guess.** Typed, time-aware claims make contradictions, deadlines and cross-claim arithmetic deterministic.
- **Deterministic access.** Policy is applied before any model call. Derived claims inherit the join of their sources' labels.
- **Agents only propose.** Actions wait in a queue; approval is bound to the evidence hash.

## Architecture

```
sources ─► ingest ─► extract (LLM) ─► GATE ─► proposed claims ─► curation ─► approved
                                                                              │
              policy (versioned, in log) ◄────────────────────────────────────┤
                         ▼                                                    ▼
          principal view ─► triggers ─► briefs (LLM wording ─► gate) ─► surfaces
                         └─► retrieve ─► answer (LLM) ─► verifier ─► surfaces
                                           └─ else "no approved evidence"
                         └─► propose_action ─► queue ─► human approval ─► mock executor
```

LLMs appear in four places only (extraction, brief wording, answers, predicate proposals), each followed by a deterministic gate.

## Stack

TypeScript end to end · Next.js (web is the UI) · SQLite via `better-sqlite3` · hand-written SQL migrations · `zod` · `vitest` · LLM calls through the Claude CLI, with record/replay caching for a deterministic demo.

## Status

| Piece | State |
|---|---|
| Sources, quotes, claims, claim events, hash chain, `verify()` | done |
| Gate: quote locate, literal / resolved / interpretive checks | done |
| Migrations with checksums; predicates registry | done |
| Web workbench: ingest, propose through gate, approve/reject, highlight quotes | done |
| Icon top bar (`src/app/nav.tsx`) and `/debug` god-mode GUI: table browser with FK navigation, read-only SQL console, integrity view | done |
| Email source contract (`docs/EMAIL_CONTRACT.md`): Markdown + YAML header, folder inbox, live watcher, append-only ingest ledger, Inbox tab | done |
| News source contract (`docs/NEWS_CONTRACT.md`): same mechanics, `domain` as unit of source trust, `corrects` link | done |
| Document source contract (`docs/DOCUMENT_CONTRACT.md`): contracts, invoices, reports, exports; `doc_type`, `supersedes` versioning, tables citable per row | done |
| LLM extraction: one Claude CLI call per source over the whole vocabulary, every claim through the gate, rejects repaired (2 rounds), auto-queued on ingest, run ledger, record/replay cache, live eval vs ground truth | done |
| Policy (`src/lib/policy.ts`, `policy-config.ts`): principals are configuration (at most 3, one curator; a world exports `principals.json`, `world:play` loads it), clearances, claim labels = join of its sources' labels, role switcher (cookie), server-enforced curation, non-interference test | done |
| Entity discovery (`src/lib/entities.ts`, `store/entities.ts`): nothing seeded; the extractor declares suppliers, customers, products, sites and people, grounded in a verbatim quote or the source's header information (author, recipients, parties, publisher), admitted automatically (no approval), ids derived from names by code, reused by name/alias | done |
| Chat (`/chat`) and answering (`src/lib/answer/`): per-identity chat with Claude over approved claims the role may see; citations numbered and verified (every cite exists and is visible, no figure that the cited claims lack), one repair round, otherwise "I don't know" | done |
| `/claims` page: claims as plain-language sentences with tier-coloured fields, quotes in context, source details, history and extractor; filters, search, grouping, live refresh | done |
| Worldgen exports `principals.json` per world (people linked to access roles, exactly 3, starter questions from the answer key) | done |
| Test suite: gate, store, tamper evidence, API routes, debug lib (~95% statements) | done |
| Derivation engine, "distrust source" blast radius | next |
| Triggers → proactive briefs (web, Slack-style mock, morning email) | next |
| Answering with citation verifier and "I don't know" | next |
| Action proposals, approval, mock executor | next |
| Scenario generator and ground-truth answer key | next |
| Statement clustering → proposed predicates | stretch |
| Impact-ranked curation queue; independence-aware corroboration | stretch |

## Demo plan (3 min)

Unprompted brief → approve one claim, reject one → cited answer only the approved claim supports → same question as two roles → out-of-data question gets "I don't know" → action waits, then approved → "distrust this source" and watch the brief rewrite.

## Layout

```
migrations/        forward-only SQL, checksummed
src/lib/gate/      the gate: locate, numbers, dates, units
src/lib/store/     DB, hash chain, migrations runner, verify
src/lib/predicates.ts   predicate vocabulary (versioned)
src/app/           Next.js UI and API routes
src/app/debug/     god-mode debug GUI (add a page: new entry in src/app/nav.tsx)
src/app/chat/      chat UI (identity cards, citations, sources)
src/lib/answer/    knowledge gate, prompt, verifier, answering
src/app/claims/    human-friendly claims page, role switcher, curation (approve / reject / retract)
src/lib/policy.ts, entities.ts   who may see what; what claims are about
docs/              scenario, source contracts (email, news, document), design docs
examples/          example emails, news, documents (`npm run inbox:example` copies them into data/inbox, data/news, data/docs)
src/lib/ingest/    email, news, document parsers, shared front-matter code, kind registry, folder ingest, watcher
```

## Run

```bash
npm install
npm run dev        # http://localhost:3000, DB at data/brain.db
npm test           # vitest
npm run test:cov   # with coverage
npm run db:reset   # wipe the local DB
npm run eval:extract   # live extraction eval against fixtures/extraction-truth.json (calls the model)
```

## Extraction settings (environment)

| Variable | Default | Meaning |
|---|---|---|
| `BRAIN_EXTRACT` | on | `off` stops automatic extraction (saves subscription quota) |
| `BRAIN_LLM_MODEL` | `sonnet` | model passed to `claude -p` |
| `BRAIN_LLM_MODE` | `auto` | `auto` replay-or-call-and-record · `live` always call · `replay` recorded responses only (offline demo) |
| `BRAIN_LLM_CACHE` | `data/llm-cache` | where responses are recorded |
| `BRAIN_EXTRACT_CONCURRENCY` | 1 | parallel extractions (1 keeps entity discovery deterministic) |
| `BRAIN_PROACTIVE` | on | `off` stops the memory from telling people about new claims on its own |
| `BRAIN_TRUST` | on | `off` makes claims wait for a curator to approve them (the original approve-first behaviour) |
| `BRAIN_PRINCIPALS` | `data/principals.json` | who can use the system; absent = the default demo cast |

## Decisions worth knowing

- **A demo database is committed.** `demo/brain.db` (with `demo/principals.json`) is the semolina scenario after its `start` and `alert` tiers: 11 claims and the Heads-up notices, hash chain verified. `npm run demo:reset` (alias `demo:load`) puts the whole demo back: that database and principals, empty source folders, and a new epoch so browsers forget old chats; the LLM cache is kept so a rehearsed run stays fast. It refuses to run while the dev server holds the database, so stop the server first. The rest of `data/` stays gitignored. The last backup slides before the ideas are the live demo: five real pages of the app (new source, claims, chat, claims, chat) embedded in the deck, driven by hand, with the arrow keys still moving the deck.
- **The memory speaks first.** When a source yields new claims, each person who may see them is considered separately (`lib/proactive`): a model, given only that person's own knowledge base, decides whether to tell them something. Senders, recipients and anyone else in the thread are never told (code, not the model). Silence is the default; messages are cited and verified like chat answers, and every decision, skips included, is stored. They appear as Heads-up cards in the chat. `BRAIN_PROACTIVE=off` disables it.
- **New sources can be simulated live.** The `/sources` page turns a short request into drafted emails, articles or documents; code writes the headers, the real parser checks them, and nothing is written until a person accepts the preview. Accepted files land in the source folders and arrive like any other.
- **Claims are trusted by default.** A claim that passes the gate is approved on admission by the policy (recorded as `policy:trust-by-default`, never as a person) and is usable at once. Curation means rejecting what is wrong; a rejection sticks even if the same fact is read again. `BRAIN_TRUST=off` restores approve-first.
- **Entities are discovered, never approved.** Recognising a supplier, product or person is not an action. Grounding is mechanical (quote or header information); a wrong guess costs a duplicate name, not a wrong decision.
- **People and roles are configuration.** Each world defines its (at most three) users; the app has no built-in cast.

- **One abstention message.** Every "no" is "I don't know": missing data, nothing approved, and data the asker may not see all read the same, so refusals never reveal that hidden data exists.
- **Access is a pure function** of (principal, claim labels). Labels are the union over every source a claim rests on; one restricted source makes the claim restricted. No model is involved.
- **Identity is a demo cookie** (`brain_principal`, set by the role switcher). There is no login; the server applies policy to whoever is named. Curation actors come from the principal, never from the request body.
- **Entity ids are enforced at admission** (gate), not at audit, so `verify()` still passes claims admitted before an entity existed. Changing the registry changes the vocabulary hash, which queues re-extraction.
