// Runs once when the Next server starts: watch every source folder, and extract claims from what arrives.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startWatchers } = await import("@/lib/ingest/start");
  startWatchers();
}
