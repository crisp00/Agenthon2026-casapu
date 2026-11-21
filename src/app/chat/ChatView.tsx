"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { setPrincipalId, useActor, useEpoch } from "../components/principal";
import { AssistantMessage, Typing, UserMessage, type Msg } from "./Message";
import { NoticeFeed, type Notice } from "./Notices";
import { ArrowIcon, Avatar, BrainMark, PlusIcon, SendIcon } from "./ui";

type Knowledge = { approved: { claim_id: string; sentence: string; labels: string[] }[]; pending: number };

// ---- per-identity conversations, kept in this browser only ----
const EVT = "brain-chat-store";
let EPOCH = "0"; // see useEpoch: conversations are kept per demo epoch
const key = (id: string) => `brain-chat:${EPOCH}:${id}`;
const readRaw = (id: string) => {
  try {
    return localStorage.getItem(key(id)) ?? "[]";
  } catch {
    return "[]";
  }
};
const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
};
function useChat(id: string): Msg[] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(id), () => "[]");
  return useMemo(() => {
    try {
      return JSON.parse(raw) as Msg[];
    } catch {
      return [];
    }
  }, [raw]);
}
function saveChat(id: string, msgs: Msg[]) {
  try {
    localStorage.setItem(key(id), JSON.stringify(msgs.slice(-40)));
  } catch {
    /* private mode or full: the chat still works for this session */
  }
  window.dispatchEvent(new Event(EVT));
}

const uid = () => Math.random().toString(36).slice(2, 10);
const clearanceLabel = (c: string[]) => (c.includes("*") ? ["everything"] : c);

export default function ChatView() {
  const { pid, me, principals } = useActor();
  const people = principals ?? [];
  const epoch = useEpoch();
  useEffect(() => {
    if (epoch !== null && epoch !== EPOCH) {
      EPOCH = epoch;
      window.dispatchEvent(new Event(EVT));
    }
  }, [epoch]);
  const messages = useChat(pid);

  const [know, setKnow] = useState<{ pid: string; data: Knowledge } | null>(null);
  const [tick, setTick] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [input, setInput] = useState("");
  const [heads, setHeads] = useState<{ pid: string; list: Notice[] } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  // what this identity has to work with
  useEffect(() => {
    if (!me) return;
    let alive = true;
    fetch("/api/chat/knowledge")
      .then((r) => r.json())
      .then((d) => { if (alive && d.approved) setKnow({ pid, data: d }); });
    return () => { alive = false; };
  }, [pid, me, tick]);

  // what the memory has decided to tell this person unprompted; checked every few seconds so a new
  // source arriving during a demo shows up on its own
  useEffect(() => {
    if (!me) return;
    let alive = true;
    const load = () =>
      fetch("/api/notices")
        .then((r) => r.json())
        .then((d) => { if (alive && d.notices) setHeads({ pid, list: d.notices }); })
        .catch(() => {});
    load();
    const t = setInterval(load, 6000);
    return () => { alive = false; clearInterval(t); };
  }, [pid, me]);

  async function dismiss(id: string) {
    setHeads((h) => (h ? { ...h, list: h.list.map((n) => (n.notice_id === id ? { ...n, seen: true } : n)) } : h));
    await fetch("/api/notices/seen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: [id] }) }).catch(() => {});
  }

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener("focus", bump);
    return () => window.removeEventListener("focus", bump);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => setPhase((p) => p + 1), 1700);
    return () => clearInterval(t);
  }, [pending]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const knowledge = know && know.pid === pid ? know.data : null;
  const notices = heads && heads.pid === pid ? heads.list : [];
  const waiting = pending === pid;

  async function send(text: string) {
    const t = text.trim();
    if (!t || pending || !me) return;
    const id = pid;
    const next: Msg[] = [...messages, { id: uid(), role: "user", content: t }];
    saveChat(id, next);
    setInput("");
    if (box.current) box.current.style.height = "auto";
    setPending(id);
    setPhase(0);
    try {
      const history = next.filter((m) => m.content).map((m) => ({ role: m.role, content: m.content })).slice(-12);
      const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history }) });
      const d = await r.json();
      const reply: Msg = r.ok
        ? { id: uid(), role: "assistant", content: d.idk ? "I don't know." : d.segments.map((s: { text: string }) => s.text).join(" "), answer: d }
        : { id: uid(), role: "assistant", content: "", error: d.error ?? "Something went wrong." };
      saveChat(id, [...next, reply]);
    } catch (e) {
      saveChat(id, [...next, { id: uid(), role: "assistant", content: "", error: `Could not reach the server: ${(e as Error).message}` }]);
    } finally {
      setPending(null);
      setTick((n) => n + 1);
      box.current?.focus();
    }
  }

  const phases = [`Reading ${knowledge?.approved.length ?? "your"} claims…`, "Writing an answer from them…", "Checking every figure and citation…"];
  const suggestions = me?.suggestions ?? [];

  return (
    <div className="chat">
      {/* ---------------------------------------------------------------- sidebar */}
      <aside className="side">
        <div className="brand">
          <span className="brand-mark"><BrainMark size={20} /></span>
          <div><b>Company Brain</b><small>Ask the team&apos;s memory</small></div>
        </div>

        <div className="side-label">Who&apos;s asking</div>
        <div className="people">
          {people.map((p) => (
            <button key={p.id} className={`person${p.id === pid ? " on" : ""}`} onClick={() => setPrincipalId(p.id)} aria-pressed={p.id === pid}>
              <Avatar id={p.id} name={p.name} />
              <span className="person-text">
                <b>{p.name}</b>
                <small>{p.role}{p.curator ? " · curator" : ""}</small>
                <span className="chips">{clearanceLabel(p.clearances).map((c) => <i key={c}>{c}</i>)}</span>
              </span>
            </button>
          ))}
        </div>

        {me && (
          <>
            <div className="side-label">What I can use</div>
            <div className="kcard">
              <div className="kbig">{knowledge ? knowledge.approved.length : "–"}</div>
              <div className="ksub">claims you may use</div>
              {knowledge && knowledge.pending > 0 && <div className="kpending">{knowledge.pending} more waiting for a curator, not usable yet</div>}
            </div>
            {knowledge && knowledge.approved.length > 0 && (
              <details className="klist">
                <summary>Show what I know</summary>
                <ul>
                  {knowledge.approved.map((c) => (
                    <li key={c.claim_id}>
                      {c.sentence}
                      <span className="chips">{c.labels.map((l) => <i key={l}>{l}</i>)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
        <p className="fineprint">Only claims you are cleared for, and that no curator has rejected, ever reach the model. Switch identity to see the difference.</p>
      </aside>

      {/* ---------------------------------------------------------------- main */}
      <main className="main">
        <header className="chead">
          {me ? (
            <div className="chead-who">
              <Avatar id={me.id} name={me.name} size={34} />
              <div>
                <div className="ctitle">Chatting as {me.name}</div>
                <div className="csub">{me.role} · can read {clearanceLabel(me.clearances).join(", ")}</div>
              </div>
            </div>
          ) : (
            <div className="ctitle">Chat</div>
          )}
          {me && messages.length > 0 && (
            <button className="ghost" onClick={() => saveChat(pid, [])}><PlusIcon /> New chat</button>
          )}
        </header>

        <div className="scroll" ref={scroller}>
          <div className="col">
            {!me && (
              <div className="gate">
                <span className="brand-mark big"><BrainMark size={26} /></span>
                <h1>Who&apos;s asking?</h1>
                <p>The memory answers differently depending on who you are. Pick a colleague to begin.</p>
                <div className="gate-people">
                  {people.map((p) => (
                    <button key={p.id} className="gate-card" onClick={() => setPrincipalId(p.id)}>
                      <Avatar id={p.id} name={p.name} size={52} />
                      <b>{p.name}</b>
                      <small>{p.role}</small>
                      <span className="chips">{clearanceLabel(p.clearances).map((c) => <i key={c}>{c}</i>)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {me && <NoticeFeed notices={notices} onDismiss={dismiss} onAsk={send} />}

            {me && messages.length === 0 && !waiting && (
              <div className="empty">
                <h1>Hi {me.name.split(" ")[0]}.</h1>
                <p>Ask anything about what the team knows. Answers come only from claims you have access to, and every one cites its sources.</p>
                {knowledge && knowledge.approved.length === 0 && (
                  <div className="callout">
                    No claims are available to you yet, so every answer will be &ldquo;I don&apos;t know&rdquo;. Add sources to the inbox folders, or{" "}
                    <Link href="/claims">review the claims</Link> that are waiting.
                  </div>
                )}
                <div className="suggest">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)}>
                      <span>{s}</span>
                      <ArrowIcon />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {me && messages.map((m) => (m.role === "user" ? <UserMessage key={m.id} m={m} who={me.id} name={me.name} /> : <AssistantMessage key={m.id} m={m} onAsk={send} />))}
            {me && waiting && <Typing phase={phases[phase % phases.length]} />}
          </div>
        </div>

        <div className="composer-wrap">
          <form
            className={`composer${!me ? " off" : ""}`}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={box}
              rows={1}
              value={input}
              disabled={!me}
              placeholder={me ? `Ask as ${me.name.split(" ")[0]}…` : "Choose who you are first"}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button className="send" type="submit" disabled={!me || !input.trim() || !!pending} aria-label="Send"><SendIcon /></button>
          </form>
          <div className="hint">Enter to send · Shift + Enter for a new line · conversations stay in this browser</div>
        </div>
      </main>
    </div>
  );
}
