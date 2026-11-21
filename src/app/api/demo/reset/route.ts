import { z } from "zod";
import { resetDemo } from "@/lib/demo-reset";

const Body = z.object({ confirm: z.literal("reset") });

/**
 * Restores the demo to its committed snapshot while the server runs: database, principals, source
 * folders and the epoch that makes browsers drop old chats. Destructive by design, so it needs an
 * explicit confirmation and is off in production.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.BRAIN_DEMO_RESET !== "on") return Response.json({ error: "demo reset is disabled" }, { status: 403 });
  if (!Body.safeParse(await req.json().catch(() => null)).success) return Response.json({ error: 'send {"confirm":"reset"}' }, { status: 400 });
  const r = await resetDemo();
  return Response.json(r, { status: r.ok ? 200 : 409 });
}
