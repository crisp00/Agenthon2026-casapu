import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { connection } from "next/server";
import { getPrincipals } from "@/lib/policy-config";
import { getDb, recordPrincipals } from "@/lib/store";

/** Who can use the system in this world (one to three people), for the role switcher and the chat. */
export async function GET() {
  await connection();
  const principals = getPrincipals();
  recordPrincipals(getDb(), principals); // a changed configuration becomes a new, logged version
  // written by the demo reset: a new value tells browsers to forget conversations from before it
  const f = join(process.env.BRAIN_EPOCH_DIR ?? join(process.cwd(), "data"), "epoch");
  const epoch = existsSync(f) ? readFileSync(f, "utf8").trim() : "0";
  return Response.json({ principals, epoch });
}
