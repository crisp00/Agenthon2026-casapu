import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { KINDS, SOURCE_KINDS } from "./ingest/inbox";
import { startWatchers, stopWatchers } from "./ingest/start";
import { principalsFile } from "./policy-config";
import { getDb, type DB } from "./store";
import type { ExtractionQueue } from "./extract/queue";

/**
 * Puts a running demo back exactly as committed, without restarting the server: the snapshot database and
 * its principals, empty source folders (so nothing is ingested twice) and a new epoch, so browsers forget
 * their old conversations. The LLM cache is kept: it is what keeps a rehearsed run fast.
 *
 * The swap itself is one synchronous block, so no request can see a half-reset database.
 */
type G = { __brainDb?: DB; __brainExtractQueue?: ExtractionQueue; __brainProactive?: Promise<void> };

export const demoDir = (): string => process.env.BRAIN_DEMO_DIR ?? join(process.cwd(), "demo");
export const epochDir = (): string => process.env.BRAIN_EPOCH_DIR ?? join(process.cwd(), "data");
const dbFile = (): string => process.env.BRAIN_DB ?? join(process.cwd(), "data", "brain.db");

export type ResetResult = { ok: true; epoch: string } | { ok: false; error: string };

const withTimeout = <T>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<"timeout">((r) => setTimeout(() => r("timeout"), ms))]);

export async function resetDemo(opts: { waitMs?: number } = {}): Promise<ResetResult> {
  const snapshot = join(demoDir(), "brain.db");
  const principals = join(demoDir(), "principals.json");
  if (!existsSync(snapshot) || !existsSync(principals)) return { ok: false, error: `no demo snapshot in ${demoDir()}` };

  const g = globalThis as unknown as G;
  getDb(); // make sure there is a connection to close

  // Let whatever is running finish, so nothing writes to a database that is about to be replaced.
  stopWatchers();
  const busy = await withTimeout(Promise.all([g.__brainExtractQueue?.idle(), g.__brainProactive]), opts.waitMs ?? 120_000);
  if (busy === "timeout") {
    startWatchers();
    return { ok: false, error: "extraction is still running; try again in a moment" };
  }

  const epoch = String(Date.now());
  // ---- one synchronous swap
  g.__brainDb?.close();
  g.__brainDb = undefined;
  g.__brainExtractQueue = undefined;
  g.__brainProactive = undefined;

  const db = dbFile();
  mkdirSync(dirname(db), { recursive: true });
  for (const f of [db, `${db}-wal`, `${db}-shm`]) rmSync(f, { force: true });
  copyFileSync(snapshot, db);
  mkdirSync(dirname(principalsFile()), { recursive: true });
  copyFileSync(principals, principalsFile());

  for (const kind of SOURCE_KINDS) {
    const dir = KINDS[kind].dir();
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir)) if (f.endsWith(".md")) rmSync(join(dir, f), { force: true });
  }
  mkdirSync(epochDir(), { recursive: true });
  writeFileSync(join(epochDir(), "epoch"), epoch + "\n");

  getDb(); // reopen on the restored file
  startWatchers();
  return { ok: true, epoch };
}
