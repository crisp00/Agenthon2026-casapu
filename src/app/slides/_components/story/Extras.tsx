"use client";

import { At } from "../step";
import { Left } from "./Story";

/* ============================ BACKUP · the ideas, and the honest scope ============================ */

const IDEAS: [string, string, string, string][] = [
  ["01", "Atomic claims, with evidence at the core.", "Every fact is a small claim tied to a verbatim quote. The model’s interpretation is fenced to a single tier: literal values are read in the quote, resolved ones are recomputed by code, and only the interpretive ones are judged by a person.", "claims · evidence"],
  ["02", "An immutable store, so the memory can be regenerated.", "Sources and claims are append-only, in one hash chain that verify() re-checks. Re-extracting from the same sources is idempotent, and access is computed when a claim is read, so changing the policy rewrites nothing.", "immutable · policy"],
  ["03", "A deterministic gate.", "Plain code, no model. The quote must be a verbatim slice of its source, and the database itself refuses one that isn’t. Every literal value must be found in the quote. A wrong value bounces back to the model with the error.", "gate · no model"],
];

export function IdeasStory() {
  return (
    <div className="st-full" style={{ alignContent: "center" }}>
      <div className="sl-eyebrow">Under the hood</div>
      <h1 style={{ fontSize: "1.9em", margin: ".25em 0 .9em", lineHeight: 1.08 }}>
        Three ideas <span className="st-hl">worth stealing.</span>
      </h1>
      <div className="st-grid3" style={{ gap: "1.2em" }}>
        {IDEAS.map(([n, t, d, tag], i) => (
          <At key={n} from={i}>
            <div className="st-panel" style={{ padding: "1.3em 1.4em 1.5em", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="st-mono" style={{ color: "var(--accent-ink)", fontWeight: 700, fontSize: ".8em" }}>{n}</span>
                <span className="st-tag acc">{tag}</span>
              </div>
              <b style={{ display: "block", fontSize: "1.35em", margin: ".8em 0 .6em", lineHeight: 1.15, letterSpacing: "-.02em" }}>{t}</b>
              <p style={{ margin: 0, fontSize: ".85em", lineHeight: 1.6, color: "var(--muted)" }}>{d}</p>
            </div>
          </At>
        ))}
      </div>
    </div>
  );
}

const REAL = ["Sources, claims and the gate", "Chat with citations and “I don’t know”", "Heads-up: it speaks first"];
const SCRIPTED = ["The story slides", "Purchase order and approvals"];
const MISSING = ["Derived claims (the maths)", "Recompute on a correction", "Real connectors and login"];

function Column({ title, tag, cls, items, at }: { title: string; tag: string; cls: string; items: string[]; at: number }) {
  const color = cls === "ok" ? "var(--ok)" : cls === "warn" ? "var(--warn)" : "var(--bad)";
  return (
    <At from={at}>
      <div className="st-panel" style={{ height: "100%" }}>
        <div className="hd"><span>{title}</span><span className={`st-tag ${cls}`}>{tag}</span></div>
        <ul style={{ listStyle: "none", margin: 0, padding: ".4em 1.1em .8em" }}>
          {items.map((t) => (
            <li key={t} className="st-row" style={{ justifyContent: "flex-start", gap: ".8em", fontSize: ".95em", lineHeight: 1.35 }}>
              <span className="st-mono" style={{ color, flex: "none" }}>{cls === "ok" ? "✓" : cls === "warn" ? "◐" : "✕"}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </At>
  );
}

export function ScopeStory() {
  return (
    <div className="st-full" style={{ alignContent: "center" }}>
      <Left eyebrow="Scope" title={<>What is real, what is staged, <span className="st-hl">what is missing.</span></>} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1em", marginTop: ".4em", alignItems: "stretch" }}>
        <Column title="Built and running" tag="the live app" cls="ok" items={REAL} at={0} />
        <Column title="Staged in the slides" tag="scripted" cls="warn" items={SCRIPTED} at={1} />
        <Column title="Not built yet" tag="honest gaps" cls="bad" items={MISSING} at={2} />
      </div>
    </div>
  );
}
