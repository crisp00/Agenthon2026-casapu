"use client";

import { useEffect, useRef } from "react";

/** Hides the app's own top bar inside the frame: the deck already has one. */
const EMBED_CSS = `
  .topbar { display: none !important; }
  .chat, .newsrc { height: 100dvh !important; }
`;

/** Keys the deck listens to, which the frame hands back when you are not typing. */
const DECK_KEYS = new Set(["ArrowLeft", "ArrowRight", "PageUp", "PageDown"]);

const typing = (el: Element | null) => {
  const t = el as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
};

/**
 * A page of the real app inside a slide, for the live demo. You do everything by hand in it; the deck only
 * moves between pages. The arrow keys keep working after you have clicked inside the page (the page
 * would otherwise swallow them), except while you are typing.
 *
 * The frame is set up from an effect, not from React's onLoad: the iframe can finish loading before the
 * page hydrates, and a load event that fires first is never delivered to onLoad.
 */
export default function DemoFrame({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    const bound = new WeakSet<Window>();

    const setup = () => {
      const win = f.contentWindow;
      const doc = f.contentDocument;
      if (!win || !doc || !doc.head) return;
      // The page may rebuild its <head> while it hydrates, so the style is kept in place, not only added once.
      if (!doc.getElementById("deck-embed")) {
        const style = doc.createElement("style");
        style.id = "deck-embed";
        style.textContent = EMBED_CSS;
        doc.head.appendChild(style);
      }
      if (bound.has(win)) return;
      bound.add(win);
      win.addEventListener("keydown", (k) => {
        if (!DECK_KEYS.has(k.key) || k.metaKey || k.ctrlKey || k.altKey || typing(doc.activeElement)) return;
        k.preventDefault();
        window.dispatchEvent(new KeyboardEvent("keydown", { key: k.key }));
      });
    };

    f.addEventListener("load", setup);
    setup();
    const t = setInterval(setup, 400);
    return () => {
      f.removeEventListener("load", setup);
      clearInterval(t);
    };
  }, [src]);

  return (
    <div style={{ position: "relative", height: "calc(100% - 14px)", minHeight: "60dvh" }}>
      <iframe
        ref={frame}
        src={src}
        title={title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "1px solid var(--line)", borderRadius: 4, background: "var(--bg)" }}
      />
    </div>
  );
}
