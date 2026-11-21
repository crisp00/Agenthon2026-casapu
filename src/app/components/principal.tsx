"use client";

import { useEffect, useSyncExternalStore } from "react";
import { PRINCIPAL_COOKIE, type Principal } from "@/lib/policy";

/**
 * The acting role, kept in a cookie so the server sees it on every request
 * ("god" = no cookie = the debug tools, no filtering). Demo identity: there is
 * no login; the server's job is to apply policy deterministically to whoever is named.
 * Who the roles are (one to three people) comes from the server: it is configuration.
 */
const EVENT = "brain-principal";

// ---- the list of principals, fetched once from the server
let cached: Principal[] | null = null;
let cachedEpoch: string | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function load() {
  if (cached || inflight) return;
  inflight = fetch("/api/principals")
    .then((r) => r.json())
    .then((d) => {
      cached = d.principals ?? null;
      cachedEpoch = typeof d.epoch === "string" ? d.epoch : "0";
    })
    .catch(() => {
      /* leave null: the pages show their loading state */
    })
    .finally(() => {
      inflight = null;
      listeners.forEach((l) => l());
    });
}

/** The principals configured for this world, or null while loading. */
export function usePrincipals(): Principal[] | null {
  useEffect(() => {
    load();
  }, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cached,
    () => null,
  );
}

/** Changes when the demo is reset, so a browser stops showing conversations from before it. Null while loading. */
export function useEpoch(): string | null {
  useEffect(() => {
    load();
  }, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cachedEpoch,
    () => null,
  );
}

function read(): string {
  const m = new RegExp(`(?:^|;\\s*)${PRINCIPAL_COOKIE}=([^;]*)`).exec(document.cookie);
  return m ? decodeURIComponent(m[1]) : "";
}

/** The id in the cookie ("" when none). May name someone who no longer exists after a world change. */
export function usePrincipalId(): string {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    read,
    () => "",
  );
}

/** Who is acting now: `me` is null in god mode, or when the cookie names someone this world does not have. */
export function useActor(): { pid: string; me: Principal | null; principals: Principal[] | null } {
  const id = usePrincipalId();
  const principals = usePrincipals();
  const me = principals?.find((p) => p.id === id) ?? null;
  return { pid: me ? me.id : "god", me, principals };
}

export function setPrincipalId(id: string): void {
  document.cookie = id === "god" ? `${PRINCIPAL_COOKIE}=; path=/; max-age=0` : `${PRINCIPAL_COOKIE}=${encodeURIComponent(id)}; path=/; SameSite=Lax; max-age=31536000`;
  window.dispatchEvent(new Event(EVENT));
}

export function PrincipalSwitcher() {
  const { pid, principals } = useActor();
  return (
    <label className="who" title="Who is asking. Policy is applied to this role on the server.">
      <span className="muted small">viewing as</span>
      <select value={pid} onChange={(e) => setPrincipalId(e.target.value)} disabled={!principals}>
        <option value="god">God mode (everything)</option>
        {(principals ?? []).map((p) => (
          <option key={p.id} value={p.id}>{p.name} · {p.role}{p.curator ? " · curator" : ""}</option>
        ))}
      </select>
    </label>
  );
}
