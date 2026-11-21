import { extractionEnabled, enqueueExtraction, getExtractionQueue } from "../extract";
import { getDb } from "../store";
import { KINDS, SOURCE_KINDS } from "./inbox";
import { startInboxWatcher, type InboxWatcher } from "./watcher";

type G = { __brainWatcher?: InboxWatcher[] };

/** Watch every source folder and extract claims from what arrives. One set of watchers per process. */
export function startWatchers(): InboxWatcher[] {
  const g = globalThis as unknown as G;
  if (g.__brainWatcher) return g.__brainWatcher; // survive dev hot reloads
  const db = getDb();
  g.__brainWatcher = SOURCE_KINDS.map((kind) => {
    const dir = KINDS[kind].dir();
    console.log(`[${kind}] watching ${dir}`);
    return startInboxWatcher(db, dir, { kind, onIngested: (o) => o.source_id && enqueueExtraction(o.source_id) });
  });
  if (extractionEnabled()) {
    const n = getExtractionQueue().catchUp();
    console.log(`[extract] on; ${n} source(s) waiting for extraction`);
  } else console.log("[extract] off (BRAIN_EXTRACT=off)");
  return g.__brainWatcher;
}

/** Stop the watchers (they hold the database they were started with). */
export function stopWatchers(): void {
  const g = globalThis as unknown as G;
  g.__brainWatcher?.forEach((w) => w.stop());
  g.__brainWatcher = undefined;
}
