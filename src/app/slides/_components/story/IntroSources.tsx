"use client";

import { At, useStep } from "../step";

/**
 * The opening: Company Brain, and what it reads. Three kinds of source fly into it, each tagged with who may see it
 * and how far to trust it; what comes out is claims tied to a quote. No story, just the machine.
 */
const SOURCES = [
  { tag: "Email", y: 38, lines: ["from: Molino Tavoliere", "3,000 t at 470 €/t, valid until 28/11"], chips: [["finance", "acc"], ["sender", ""]] },
  { tag: "News", y: 60, lines: ["domain: mercatocereali.example", "Spot price: 502 €/t, +18%"], chips: [["public", ""], ["domain", ""]] },
  { tag: "Documents", y: 82, lines: ["contract CQ-2026-031", "412 €/t fixed, 60% of needs"], chips: [["finance", "acc"], ["versioned", ""]] },
];
const CLAIMS = [
  { y: 40, text: "Contract price · 412 €/t", cls: "acc" },
  { y: 60, text: "Spot price · 502 €/t", cls: "acc" },
  { y: 80, text: "Rumour · reliability low", cls: "warn" },
];
// geometry, in % of the stage
const SRC_X2 = 31, BRAIN_X = 56, CLAIM_X1 = 70, BRAIN_Y = 60;

export function IntroStory() {
  const step = useStep();
  return (
    <div className="in-stage">
      <At from={0} className="in-title">
        <div className="sl-eyebrow">GDG Agenthon 2026 · Live demo on a simulated pasta company</div>
        <h1 className="st-huge in-h">Company Brain</h1>
        <p className="in-sub">The colleague who knows, and speaks first.</p>
      </At>

      {/* the lines and the packets that travel along them */}
      <svg className="in-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {SOURCES.map((s) => <line key={s.tag} className={`in-line${step >= 1 ? " on" : ""}`} x1={SRC_X2} y1={s.y} x2={BRAIN_X - 4} y2={BRAIN_Y} vectorEffect="non-scaling-stroke" />)}
        {CLAIMS.map((c) => <line key={c.text} className={`in-line out${step >= 2 ? " on" : ""}`} x1={BRAIN_X + 4} y1={BRAIN_Y} x2={CLAIM_X1} y2={c.y} vectorEffect="non-scaling-stroke" />)}
      </svg>
      {step >= 1 && SOURCES.map((s, i) => (
        <i key={s.tag} className="in-pk" style={{ ["--x1" as string]: `${SRC_X2}%`, ["--y1" as string]: `${s.y}%`, ["--x2" as string]: `${BRAIN_X - 4}%`, ["--y2" as string]: `${BRAIN_Y}%`, animationDelay: `${0.6 + i * 0.55}s` }} />
      ))}
      {step >= 2 && CLAIMS.map((c, i) => (
        <i key={c.text} className="in-pk out" style={{ ["--x1" as string]: `${BRAIN_X + 4}%`, ["--y1" as string]: `${BRAIN_Y}%`, ["--x2" as string]: `${CLAIM_X1}%`, ["--y2" as string]: `${c.y}%`, animationDelay: `${0.5 + i * 0.5}s` }} />
      ))}

      {/* the sources */}
      {SOURCES.map((s, i) => (
        <At key={s.tag} from={1} className="in-src" style={{ top: `${s.y}%` }} delay={i * 0.18}>
          <div className="st-panel">
            <div className="hd"><span>{s.tag}</span><span>a file in a folder</span></div>
            <pre className="st-code" style={{ padding: ".8em 1em .5em" }}>{s.lines.join("\n")}</pre>
            <div style={{ padding: "0 1em .9em", display: "flex", gap: ".4em" }}>
              {s.chips.map(([c, k]) => <span key={c} className={`st-tag ${k}`}>{c}</span>)}
            </div>
          </div>
        </At>
      ))}

      {/* the Brain */}
      <div className="in-brain" style={{ left: `${BRAIN_X}%`, top: `${BRAIN_Y}%` }}>
        <svg width="46" height="46" viewBox="-30 -30 60 60" fill="#fff" stroke="#fff" strokeWidth="2.4"><path d="M-22 -18L22 -8L-2 20Z" fill="none" /><circle cx="-22" cy="-18" r="6" /><circle cx="22" cy="-8" r="6" /><circle cx="-2" cy="20" r="6" /></svg>
      </div>

      {/* what comes out */}
      {CLAIMS.map((c, i) => (
        <At key={c.text} from={2} className="in-claim" style={{ top: `${c.y}%`, left: `${CLAIM_X1}%` }} delay={i * 0.18}>
          <div className="st-panel" style={{ padding: ".7em 1em" }}>
            <span className={`st-tag ${c.cls}`}>proposed</span>
            <div style={{ fontWeight: 700, marginTop: ".5em" }}>{c.text}</div>
            <div className="st-mono" style={{ fontSize: ".6em", color: "var(--muted)", marginTop: ".3em" }}>tied to a verbatim quote</div>
          </div>
        </At>
      ))}

      <At from={2} delay={0.5} className="in-foot">Every source says who may see it and how far to trust it.</At>
    </div>
  );
}
