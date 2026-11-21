"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ROLES, ROLE_ORDER } from "@/lib/scenario/data";
import { MAIN_COUNT, SLIDES, slideIndex } from "@/lib/scenario/slides";
import { dispatch, useScenario } from "@/lib/scenario/store";
import Backdrop from "./Backdrop";
import { StepContext } from "./step";

const EVENT_LABEL = { report: "Market report arrives", correction: "Correction arrives" } as const;

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function RoleSwitch() {
  const s = useScenario();
  return (
    <div className="sl-roles" role="group" aria-label="Viewing as">
      <span className="sl-roles-label">Viewing as</span>
      {ROLE_ORDER.map((r) => (
        <button key={r} className={s.role === r ? "on" : ""} onClick={() => dispatch({ type: "setRole", role: r })} title={`${ROLES[r].name} · ${ROLES[r].title}`}>
          {ROLES[r].title}
        </button>
      ))}
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const s = useScenario();
  const [notes, setNotes] = useState(false);
  const [pos, setPos] = useState<{ slug: string; step: number } | null>(null);

  const slug = path.split("/").pop() ?? "";
  const idx = slideIndex(slug);
  const slide = SLIDES[idx];
  const steps = slide?.steps ?? 0;
  const api = useRef<{ next: () => void; prev: () => void; fire: () => void }>({ next: () => {}, prev: () => {}, fire: () => {} });
  const eventFired = slide?.event ? s.events.includes(slide.event) : true;
  const dark = !slide?.demo;
  // The step belongs to a slide. A step left over from the previous slide is never read: no flash of the wrong beat.
  const step = pos && pos.slug === slug ? pos.step : 0;
  const setStep = useCallback((n: number) => setPos({ slug, step: n }), [slug]);

  useEffect(() => {
    if (slug) dispatch({ type: "visit", slug });
  }, [slug]);

  useEffect(() => {
    if (!s.notice) return;
    const t = setTimeout(() => dispatch({ type: "dismissNotice" }), 4500);
    return () => clearTimeout(t);
  }, [s.notice]);

  useEffect(() => {
    const go = (i: number) => {
      const n = SLIDES[Math.max(0, Math.min(SLIDES.length - 1, i))];
      router.push(`/slides/${n.slug}`);
    };
    // The talk ends at the last main slide: walking forward never wanders into the backup slides.
    const atEnd = !slide?.backup && idx + 1 >= MAIN_COUNT;
    const next = () => (step < steps ? setStep(step + 1) : atEnd ? undefined : go(idx + 1));
    const prev = () => {
      if (step > 0) setStep(step - 1);
      else if (idx > 0) { setPos({ slug: SLIDES[idx - 1].slug, step: SLIDES[idx - 1].steps ?? 0 }); go(idx - 1); }
    };
    api.current = { next, prev, fire: () => { if (slide?.event) dispatch({ type: "event", name: slide.event }); } };
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(MAIN_COUNT - 1);
      else if (e.key === "b" || e.key === "B") go(slide?.backup ? 0 : MAIN_COUNT);
      else if (e.key === "e" || e.key === "E") { if (slide?.event) dispatch({ type: "event", name: slide.event }); }
      else if (e.key === "n" || e.key === "N") setNotes((v) => !v);
      else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, step, steps, slide, router, setStep]);

  // Teleprompter link: the second window shows what to say and drives the deck with its own arrow keys.
  useEffect(() => {
    if (!slug) return;
    const ch = new BroadcastChannel("brain-deck");
    const send = () => ch.postMessage({ type: "state", slug, step });
    send();
    ch.onmessage = (e) => {
      const m = e.data;
      if (m?.type === "hello") send();
      else if (m?.cmd === "next") api.current.next();
      else if (m?.cmd === "prev") api.current.prev();
      else if (m?.cmd === "event") api.current.fire();
    };
    return () => ch.close();
  }, [slug, step]);

  const atLast = !slide?.backup && idx + 1 >= MAIN_COUNT;
  const canPrev = idx >= 0 && (step > 0 || idx > 0);
  const canNext = idx >= 0 && (step < steps || !atLast);

  const total = slide?.backup ? SLIDES.length - MAIN_COUNT : MAIN_COUNT;
  const local = slide?.backup ? idx - MAIN_COUNT : idx;
  const progress = idx >= 0 ? ((local + (steps ? step / steps : 1)) / total) * 100 : 0;

  return (
    <div className="sl-root" data-theme={dark ? "dark" : "light"}>
      <Backdrop bg={slide?.bg} />
      <div className="sl-top">
        <span className="sl-brand"><i /> Company Brain</span>
        <span className="sl-act">{slide?.act}</span>
        {slide?.demo ? <RoleSwitch /> : <span />}
      </div>

      <StepContext.Provider value={step}>
        <div className="sl-stage" key={slug}>{children}</div>
      </StepContext.Provider>

      {slide?.event && !eventFired && (
        <button className="sl-event" onClick={() => dispatch({ type: "event", name: slide.event! })} title="Press E">
          ▶ {EVENT_LABEL[slide.event]} <kbd>E</kbd>
        </button>
      )}

      {s.notice && (
        <div className="sl-toast" role="status" onClick={() => dispatch({ type: "dismissNotice" })}>
          {s.notice}
        </div>
      )}

      {notes && slide && (
        <aside className="sl-notes" aria-label="Speaker notes">
          <strong>{slide.title}</strong>
          <ul>{slide.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <span className="muted small">N to hide · ← → steps and slides · E fires the event · B backup slides · F fullscreen</span>
        </aside>
      )}

      <div className="sl-foot">
        <button className="sl-navbtn" aria-label="Previous" title="Previous (←)" disabled={!canPrev} onClick={() => api.current.prev()}>‹</button>
        <button className="sl-navbtn" aria-label="Next" title="Next (→)" disabled={!canNext} onClick={() => api.current.next()}>›</button>
        <span className="sl-counter">{idx >= 0 ? `${slide?.backup ? "BACKUP " : ""}${String(local + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}` : ""}</span>
      </div>
      <div className="sl-progress" style={{ width: `${progress}%` }} />
    </div>
  );
}
