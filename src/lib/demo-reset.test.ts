import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetDemo } from "./demo-reset";
import { stopWatchers } from "./ingest/start";
import { getDb, insertSource, openDb } from "./store";

const env = { ...process.env };
let root: string;
const count = (t: string) => (getDb().prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n;
const src = (db: ReturnType<typeof getDb>, id: string) =>
  insertSource(db, { kind: "news", external_id: id, occurred_at: "2026-11-21T07:00:00Z", raw: `Testo ${id}.`, acl_labels: ["public"], meta: { title: id, domain: "d.example" } });

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "demo-reset-"));
  for (const d of ["data", "demo", "news", "inbox", "docs"]) mkdirSync(join(root, d));
  Object.assign(process.env, {
    BRAIN_DB: join(root, "data", "brain.db"),
    BRAIN_PRINCIPALS: join(root, "data", "principals.json"),
    BRAIN_EPOCH_DIR: join(root, "data"),
    BRAIN_DEMO_DIR: join(root, "demo"),
    BRAIN_NEWS: join(root, "news"),
    BRAIN_INBOX: join(root, "inbox"),
    BRAIN_DOCS: join(root, "docs"),
    BRAIN_EXTRACT: "off",
  });
  // the committed snapshot: one source
  const snap = openDb(join(root, "demo", "brain.db"));
  src(snap, "from-snapshot");
  snap.close();
  writeFileSync(join(root, "demo", "principals.json"), JSON.stringify([{ id: "ann", name: "Ann", role: "Boss", clearances: ["*"], curator: true }]));
});

afterEach(() => {
  stopWatchers();
  const g = globalThis as unknown as { __brainDb?: { close(): void }; __brainExtractQueue?: unknown };
  g.__brainDb?.close();
  g.__brainDb = undefined;
  g.__brainExtractQueue = undefined;
  process.env = { ...env };
});

describe("resetDemo", () => {
  it("restores the snapshot under a running connection and clears what was added", async () => {
    src(getDb(), "added-live"); // the app is running and has been used
    writeFileSync(join(root, "news", "added-live.md"), "x");
    expect(count("sources")).toBe(1);

    const r = await resetDemo({ waitMs: 2000 });
    expect(r.ok).toBe(true);

    expect(count("sources")).toBe(1);
    expect(getDb().prepare("SELECT external_id FROM sources").get()).toEqual({ external_id: "from-snapshot" });
    expect(readdirSync(join(root, "news"))).toEqual([]);
    expect(JSON.parse(readFileSync(join(root, "data", "principals.json"), "utf8"))[0].id).toBe("ann");
  });

  it("writes a new epoch each time, so browsers drop their chats", async () => {
    const a = await resetDemo({ waitMs: 2000 });
    await new Promise((r) => setTimeout(r, 5));
    const b = await resetDemo({ waitMs: 2000 });
    expect(a.ok && b.ok && a.epoch !== b.epoch).toBe(true);
    expect(readFileSync(join(root, "data", "epoch"), "utf8").trim()).toBe((b as { epoch: string }).epoch);
  });

  it("works again after a reset: the restored database accepts new data", async () => {
    await resetDemo({ waitMs: 2000 });
    src(getDb(), "after");
    expect(count("sources")).toBe(2);
    await resetDemo({ waitMs: 2000 });
    expect(count("sources")).toBe(1);
  });

  it("refuses when there is no snapshot, and changes nothing", async () => {
    process.env.BRAIN_DEMO_DIR = join(root, "nowhere");
    src(getDb(), "keep");
    const r = await resetDemo({ waitMs: 2000 });
    expect(r.ok).toBe(false);
    expect(count("sources")).toBe(1);
    expect(existsSync(join(root, "data", "epoch"))).toBe(false);
  });
});
