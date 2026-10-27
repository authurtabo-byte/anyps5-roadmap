// The lists the views show: the filters and sort orders of the game list and the blocker list.
// Pure functions over the model, so tests and views share them.

import type { Accessors, Dir } from "../lib/sort";
import { fold, matchesTerms, searchTerms, startsWord } from "../lib/text";
import type { BlockerRow, GameRow } from "./model";

// -- blockers -------------------------------------------------------------------

export const BLOCKER_FILTERS = {
  open: { label: "Open", test: (r: BlockerRow) => r.open },
  review: { label: "Fix in review", test: (r: BlockerRow) => r.fix.kind === "review" },
  nofix: { label: "No open fix", test: (r: BlockerRow) => r.open && r.fix.kind !== "review" },
  help: { label: "Help wanted", test: (r: BlockerRow) => r.open && r.helpWanted },
  unlinked: { label: "No game linked", test: (r: BlockerRow) => r.open && r.rank == null },
  resolved: { label: "Fixed", test: (r: BlockerRow) => !r.open },
} as const;

export type BlockerFilter = keyof typeof BLOCKER_FILTERS;

export interface BlockerQuery {
  status: BlockerFilter;
  area: string; // "" for every area
  q: string;
}

export function filterBlockers(rows: readonly BlockerRow[], { status, area, q }: BlockerQuery): BlockerRow[] {
  const terms = searchTerms(q);
  const test = BLOCKER_FILTERS[status].test;
  return rows.filter((r) => test(r) && (!area || r.area === area) && matchesTerms(r.search, terms));
}

const FIX_ORDER = { review: 0, partial: 1, closed: 2, none: 3, resolved: 4 } as const;

export const BLOCKER_SORTS = ["rank", "title", "area", "status", "games", "score", "activity"] as const;
export type BlockerSort = (typeof BLOCKER_SORTS)[number];

export const blockerAccessors: Accessors<BlockerRow, BlockerSort> = {
  rank: (r) => r.rank,
  title: (r) => r.title,
  area: (r) => r.area,
  status: (r) => FIX_ORDER[r.fix.kind],
  games: (r) => (r.open ? r.games : null),
  score: (r) => (r.open ? r.score : null),
  activity: (r) => r.lastActivity,
};

/** The direction a column sorts in when it is first clicked. */
export const blockerNatural: Record<BlockerSort, Dir> = {
  rank: "asc",
  title: "asc",
  area: "asc",
  status: "asc",
  games: "desc",
  score: "desc",
  activity: "desc",
};

// -- games ----------------------------------------------------------------------

export interface GameQuery {
  stage: string; // "all", a stage name, or "none"
  tag?: string; // a tag name; empty or missing for every game
  q: string;
}

/**
 * How well one term fits one game, weighted by where it was found.
 *
 * A name is what someone typing "gta" means; a mention inside another game's stop is what they
 * mean only when nothing else matches. Before this, both scored the same and a search for "gta"
 * opened with Minecraft.
 */
function termScore(g: GameRow, term: string): number {
  const names = [fold(g.name), ...(g.game.aliases ?? []).map(fold)];
  let best = 0;
  for (const name of names) {
    if (name === term) best = Math.max(best, 260);
    else if (startsWord(name, term)) best = Math.max(best, 170);
    else if (name.includes(term)) best = Math.max(best, 90);
  }
  for (const id of g.ids) {
    const folded = fold(id);
    if (folded === term) best = Math.max(best, 320);
    else if (folded.startsWith(term) || folded.includes(term)) best = Math.max(best, 120);
  }
  if (best === 0) {
    const meta = fold([g.game.engine, g.game.kind, ...g.tags].filter(Boolean).join(" "));
    if (meta.includes(term)) best = 30;
  }
  if (best === 0) {
    const stops =
      g.stopText || fold([g.firstStop?.title, g.firstStop?.blocker.signature].filter(Boolean).join(" "));
    if (stops.includes(term)) best = 10;
  }
  if (best === 0 && (g.search ?? "").includes(term)) best = 5;
  return best;
}

/** The game's score for a whole query, or null when any term finds nothing in it. */
export function matchScore(g: GameRow, terms: readonly string[]): number | null {
  if (!terms.length) return 0;
  let total = 0;
  for (const term of terms) {
    const score = termScore(g, term);
    if (!score) return null;
    total += score;
  }
  return total;
}

// The relevance of each row for the current query, read by the "Best match" sort.
const MATCH = new WeakMap<GameRow, number>();

export function filterGames(rows: readonly GameRow[], { stage, tag = "", q }: GameQuery): GameRow[] {
  const terms = searchTerms(q);
  return rows.filter(
    (g) =>
      (stage === "all" || (stage === "none" ? g.stage == null : g.stage === stage)) &&
      (!tag || g.tags.includes(tag)) &&
      (terms.length === 0 || matchScore(g, terms) !== null),
  );
}

/** Games per stage chip ("all", each stage name, "none"). */
export function stageCounts(rows: readonly GameRow[]): Map<string, number> {
  const n = new Map<string, number>([["all", rows.length]]);
  for (const g of rows) n.set(g.stage ?? "none", (n.get(g.stage ?? "none") ?? 0) + 1);
  return n;
}

/** Games per tag: a game counts once for each of its tags. */
export function tagCounts(rows: readonly GameRow[]): Map<string, number> {
  const n = new Map<string, number>();
  for (const g of rows) for (const t of g.tags) n.set(t, (n.get(t) ?? 0) + 1);
  return n;
}

/**
 * The game list: one row per game. The search reads every title ID, alias and name of a game, so a region's
 * title ID or a short form such as "GTA V" finds it.
 */
export function gameList(rows: readonly GameRow[], query: GameQuery): GameRow[] {
  const matched = filterGames(rows, query);
  const terms = searchTerms(query.q);
  // relevance is rebuilt every query; without one, every row scores zero and "Best match" keeps the
  // order it was given
  for (const g of rows) MATCH.set(g, terms.length ? (matchScore(g, terms) ?? 0) : 0);
  // a whole title ID is a lookup, not a search: the game that owns it, without the games that merely
  // mention it in a stop line
  const wanted = query.q.trim().toLowerCase();
  if (/^(ppsa|cusa)\d{5}$/.test(wanted)) {
    const owners = matched.filter((g) => g.ids.some((id) => id.toLowerCase() === wanted));
    if (owners.length) return owners;
  }
  return matched;
}

export const GAME_SORTS = ["match", "name", "stage", "stop", "chain", "report"] as const;
export type GameSort = (typeof GAME_SORTS)[number];

export const gameAccessors: Accessors<GameRow, GameSort> = {
  match: (g) => MATCH.get(g) ?? null,
  name: (g) => g.name,
  // no stage ranks below the first stage, so it leads "Earliest first" and trails "Furthest first"
  stage: (g) => g.stageRank,
  stop: (g) => g.firstStop?.rank ?? (g.firstStop ? 1e6 : null),
  chain: (g) => g.steps.length || null,
  report: (g) => g.lastReport,
};

export const gameNatural: Record<GameSort, Dir> = {
  match: "desc",
  name: "asc",
  stage: "desc",
  stop: "asc",
  chain: "desc",
  report: "desc",
};
