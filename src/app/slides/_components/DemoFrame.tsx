"use client";

import { useRef } from "react";

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
 */
export default function DemoFrame({ src, title }: { src: string; title: string }) {
  const bound = useRef<WeakSet<Window>>(new WeakSet());

  function onLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    const win = e.currentTarget.contentWindow;
    const doc = e.currentTarget.contentDocument;
    if (!win || !doc) return;
    if (!doc.getElementById("deck-embed")) {
      const style = doc.createElement("style");
      style.id = "deck-embed";
      style.textContent = EMBED_CSS;
      doc.head.appendChild(style);
    }
    if (bound.current.has(win)) return;
    bound.current.add(win);
    win.addEventListener("keydown", (k) => {
      if (!DECK_KEYS.has(k.key) || k.metaKey || k.ctrlKey || k.altKey || typing(doc.activeElement)) return;
      k.preventDefault();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: k.key }));
    });
  }

  return (
    <div style={{ position: "relative", height: "calc(100% - 14px)", minHeight: "60dvh" }}>
      <iframe
        src={src}
        title={title}
        onLoad={onLoad}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "1px solid var(--line)", borderRadius: 4, background: "var(--bg)" }}
      />
    </div>
  );
}
