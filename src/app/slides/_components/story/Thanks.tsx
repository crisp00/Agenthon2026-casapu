"use client";

import { At } from "../step";

export function ThanksStory() {
  return (
    <div className="st-full">
      <At from={0} className="st-kicker" style={{ position: "absolute", top: "10%" }}>GDG Agenthon 2026 · Challenge A</At>
      <At from={0} delay={0.2}><h1 className="st-huge">Thank you.</h1></At>
      <At from={1}>
        <p className="st-big" style={{ color: "var(--muted)", fontSize: "clamp(22px,2.8vw,44px)", marginTop: ".4em", maxWidth: "22em" }}>
          Company Brain: the colleague who knows, and speaks first.
        </p>
        <p className="st-mid" style={{ marginTop: ".8em" }}>Questions?</p>
      </At>
    </div>
  );
}
