// Fetches the JSON files the Python generator publishes.
//
// Where they come from is deliberately not the deployed build. The map is rewritten on a
// schedule — every five minutes for the status, every half hour for the data — and shipping a
// new build that often is both wasteful and capped by the host. `VITE_DATA_BASE` is fixed at
// build time, once, when the app is first deployed; empty means "read the files next to
// index.html", which is what a local run and an offline build want.
//
// `useJson` can also revalidate on a timer. The point is that a visitor watching the page sees
// the map change without reloading: the fetch is conditional (the browser sends If-None-Match
// and the server answers 304 for an unchanged file), and state is only replaced when the bytes
// actually differ, so nothing re-renders for nothing.

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Snapshot } from "./feed";
import type { Model } from "./model";

const BASE = (import.meta.env.VITE_DATA_BASE ?? "").replace(/\/+$/, "");

/** The URL for one of the generator's files, or the URL itself when it is already absolute. */
export function dataUrl(name: string): string {
  if (/^[a-z]+:\/\//i.test(name)) return name;
  // Root-absolute, not relative: on /games/PPSA01746 a bare "roadmap.json" resolves to
  // /games/roadmap.json and 404s, which is what blanked every deep link.
  const clean = name.replace(/^\/+/, "");
  return BASE ? `${BASE}/${clean}` : `/${clean}`;
}

export type Loaded<T> =
  | { status: "loading" }
  | { status: "ready"; data: T; bytes: number }
  | { status: "missing" } // 404: an offline build has no feed.json
  | { status: "error"; message: string };

export function useJson<T>(url: string, pollMs = 0): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({ status: "loading" });
  const lastText = useRef<string | null>(null);

  useEffect(() => {
    const ctl = new AbortController();
    const href = dataUrl(url);

    const read = async (first: boolean) => {
      try {
        const res = await fetch(href, { signal: ctl.signal, cache: first ? "default" : "no-cache" });
        if (res.status === 404) {
          if (first) setState({ status: "missing" });
          return;
        }
        if (!res.ok) throw new Error(`${href} answered HTTP ${res.status}`);
        const text = await res.text();
        // A conditional request that the server answers from cache still returns a body here,
        // so the cheap test is whether anything changed at all.
        if (!first && text === lastText.current) return;
        lastText.current = text;
        setState({ status: "ready", data: JSON.parse(text) as T, bytes: new TextEncoder().encode(text).length });
      } catch (e) {
        if (ctl.signal.aborted) return;
        if (first) setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
        // A failed poll keeps the last good data on screen: a blip must not blank the page.
      }
    };

    void read(true);
    if (pollMs <= 0) return () => ctl.abort();

    const id = setInterval(() => void read(false), pollMs);
    // A tab in the background does not need to poll; coming back to it should be immediate.
    const onVisible = () => {
      if (document.visibilityState === "visible") void read(false);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      ctl.abort();
    };
  }, [url, pollMs]);

  return state;
}

export interface Data {
  model: Model;
  snapshots: Snapshot[]; // feed.json, newest first; empty without a feed
  feed: "loading" | "ready" | "missing" | "error";
  resolvedAt: Map<string, string>;
  sizes: Record<string, number>; // bytes of the files the app has read
}

export const DataContext = createContext<Data | null>(null);

export function useData(): Data {
  const d = useContext(DataContext);
  if (!d) throw new Error("useData outside DataContext");
  return d;
}
