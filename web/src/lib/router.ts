// Path routing, so every view and every blocker or game has a plain URL:
//
//   /                         roadmap          /blockers?status=review&area=AGC+driver&sort=-games
//   /blockers/2548            a blocker        /games?stage=Presents&q=unity
//   /games/PPSA01746          a game (title)   /coverage  /changes  /data
//
// This used to be hash routing, because GitHub Pages cannot rewrite an unknown path to
// index.html. The site is served by a static server now, where the `try_files {path} {path}/ /index.html`
// already hands any deep path to the app, so the hash is gone and the links read normally.
//
// Old `#/games` links still work: they are rewritten to their path form once at start, so
// anything already shared keeps landing on the right page.
//
// A blocker or game opens in a drawer over the view it was opened from. That view travels in
// history.state.under, so the link itself stays the canonical one. Opened from a link (no state),
// the drawer sits over the blocker or game list. The classic page's anchors (#b-2548, #g-PPSA01746,
// #fix-next, #top), which older feed items link to, map onto these routes.

import { useMemo, useSyncExternalStore } from "react";

export const VIEWS = ["roadmap", "blockers", "games", "coverage", "changes", "data"] as const;
export type View = (typeof VIEWS)[number];

export interface Item {
  kind: "blocker" | "game";
  id: string;
}

export interface Route {
  view: View;
  item: Item | null;
  params: URLSearchParams;
  href: string; // canonical, e.g. /games/PPSA01746?q=stray
  hash: string; // the same string; kept so callers that read `.hash` keep working
}

/** The directory the app is served from: "" at the root, or "/anyps5-roadmap" under a subpath. */
const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");

/** A route of the classic page, or a bare id, as a path. */
const LEGACY: Record<string, string> = {
  top: "/",
  "fix-next": "/blockers",
  games: "/games",
  coverage: "/coverage",
  data: "/data",
};

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** The app's form of any address: an old hash, a classic anchor, or a path already. */
export function canonical(input: string): string {
  const raw = input || "";
  if (raw.startsWith("/")) return withBase(raw);
  const id = decode(raw.replace(/^#/, ""));
  if (id.startsWith("/")) return withBase(id);
  if (id.startsWith("b-") && id.length > 2) return itemHref({ kind: "blocker", id: id.slice(2) });
  if (id.startsWith("g-") && id.length > 2) return itemHref({ kind: "game", id: id.slice(2) });
  return withBase(LEGACY[id] ?? "/");
}

/** Puts the deployment's base in front of a root-relative path. */
function withBase(path: string): string {
  if (!BASE) return path;
  if (path === BASE || path.startsWith(`${BASE}/`) || path.startsWith(`${BASE}?`)) return path;
  return `${BASE}${path}`;
}

/** Drops the deployment's base, so the parser only ever sees "/games/...". */
function withoutBase(path: string): string {
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) return path.slice(BASE.length) || "/";
  return path;
}

export function parsePath(input: string): Route {
  const c = canonical(input);
  const [path, query = ""] = c.split("?");
  const parts = withoutBase(path).split("/").filter(Boolean).map(decode);
  const view: View = (VIEWS as readonly string[]).includes(parts[0]) ? (parts[0] as View) : "roadmap";
  let item: Item | null = null;
  if (parts[1] && view === "blockers") item = { kind: "blocker", id: parts[1] };
  if (parts[1] && view === "games") item = { kind: "game", id: parts[1] };
  return { view, item, params: new URLSearchParams(query), href: c, hash: c };
}

/** Kept for callers written against the hash router; it parses either form. */
export const parseHash = parsePath;

export function viewHref(view: View, params?: Record<string, string | null | undefined> | URLSearchParams): string {
  const q = new URLSearchParams();
  const entries = params instanceof URLSearchParams ? [...params] : Object.entries(params ?? {});
  for (const [k, v] of entries) if (v) q.set(k, v);
  const qs = q.toString();
  const path = view === "roadmap" ? "/" : `/${view}`;
  return withBase(`${path}${qs ? `?${qs}` : ""}`);
}

export function itemHref(item: Item): string {
  return withBase(`/${item.kind === "blocker" ? "blockers" : "games"}/${encodeURIComponent(item.id)}`);
}

// -- the location as a store ---------------------------------------------------

interface Snap {
  href: string; // pathname + search
  under: string | null;
}

function read(): Snap {
  const st = history.state as { under?: unknown } | null;
  return {
    href: `${location.pathname}${location.search}`,
    under: typeof st?.under === "string" ? st.under : null,
  };
}

let snap: Snap =
  typeof window === "undefined" ? { href: "/", under: null } : read();
const listeners = new Set<() => void>();

function emit() {
  const next = read();
  if (next.href !== snap.href || next.under !== snap.under) snap = next;
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  addEventListener("popstate", emit);
  addEventListener("hashchange", emit);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function navigate(to: string, opts: { replace?: boolean; under?: string | null } = {}) {
  const state = opts.under ? { under: opts.under } : null;
  if (opts.replace) history.replaceState(state, "", to);
  else history.pushState(state, "", to);
  emit();
}

/** Rewrites an old hash link, or a classic anchor, into its path form once at start. */
export function adoptLegacyHash() {
  const hash = location.hash;
  if (!hash || hash.startsWith("#/")) {
    // "#/games" style: move it out of the hash and into the path.
    if (hash.startsWith("#/")) {
      const target = withBase(hash.slice(1));
      history.replaceState(null, "", `${target}${location.search}`);
    }
  } else {
    history.replaceState(null, "", canonical(hash));
  }
  snap = read();
}

export interface Location {
  route: Route; // what the address says
  under: Route; // the view rendered beneath the drawer (or the view itself)
}

export function useLocation(): Location {
  const s = useSyncExternalStore(subscribe, () => snap);
  return useMemo(() => {
    const route = parsePath(s.href);
    let under = route.item ? parsePath(viewHref(route.view)) : route;
    if (route.item && s.under) {
      const bg = parsePath(s.under);
      if (!bg.item) under = bg;
    }
    return { route, under };
  }, [s]);
}

/** Opens a blocker or game over the current view. */
export function openItem(item: Item, loc: Location, replace = false) {
  navigate(itemHref(item), { under: loc.under.href, replace });
}

/** Closes the drawer onto the view beneath it. */
export function closeItem(loc: Location) {
  navigate(loc.under.href);
}

/** Replaces the query of the view beneath the drawer (filters, search, sort) without a history entry. */
export function setParams(loc: Location, changes: Record<string, string | null>) {
  const params = new URLSearchParams(loc.under.params);
  for (const [k, v] of Object.entries(changes)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const under = viewHref(loc.under.view, params);
  if (loc.route.item) navigate(loc.route.href, { replace: true, under });
  else navigate(under, { replace: true });
}

// Whether the drawer should take focus when it opens: yes after Enter on a link, no after a mouse
// click or the arrow keys in a list (those keep focus where it is, so the list stays usable).
let focusNext = false;
export function setFocusOnOpen(v: boolean) {
  focusNext = v;
}
export function takeFocusOnOpen(): boolean {
  const v = focusNext;
  focusNext = false;
  return v;
}

// The link that opened the drawer, so closing it can give focus back. Links inside the drawer do not
// count: they are gone once it closes.
let opener: HTMLElement | null = null;
export function setOpener(el: HTMLElement) {
  if (!el.closest(".drawer")) opener = el;
}
export function getOpener(): HTMLElement | null {
  return opener;
}
