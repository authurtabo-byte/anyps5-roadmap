// Text matching for the search boxes: case and accents never decide a match.

/** Lower case without Latin accents, so "yotei" finds "Yōtei" and "pokemon" finds "Pokémon". */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * The terms of a query: its words, and each "quoted part" as one term with its spaces. A row matches when it
 * holds every term, in any order, so an error line pasted in quotes still has to appear as written.
 */
export function searchTerms(q: string): string[] {
  const terms: string[] = [];
  for (const m of fold(q).matchAll(/"([^"]+)"|(\S+)/g)) {
    const term = (m[1] ?? m[2].replaceAll('"', "")).trim();
    if (term) terms.push(term);
  }
  return terms;
}

export function matchesTerms(haystack: string, terms: readonly string[]): boolean {
  return terms.every((t) => haystack.includes(t));
}

/** True when a term starts a word in the haystack: "gta" starts "gta v", not "outgta". */
export function startsWord(haystack: string, term: string): boolean {
  return haystack.startsWith(term) || haystack.includes(` ${term}`);
}

/** A stop that was filed for a different title than the one it is being read under. */
export interface ForeignTitle {
  id: string; // the title ID the issue was filed for
  rest: string; // the symptom, with the other game's name taken off the front
}

const TITLE_ID = /\b(?:PPSA|CUSA)\d{5}\b/g;

/** A stop title split into the game that filed it and the symptom. */
export function stopTitle(title: string): ForeignTitle | null {
  const found = [...title.matchAll(TITLE_ID)];
  if (!found.length) return null;
  const first = found[0];
  const id = first[0];
  const tail = title.slice((first.index ?? 0) + id.length);
  const colon = tail.indexOf(":");
  // "GTA V (PPSA04264) stops before the menu: color export ..." -> the part after the colon
  // "The King is Watching (01.000.300) PPSA34959 - Crash ..." -> the part after the ID and its dash
  const rest = colon >= 0 ? tail.slice(colon + 1).trim() : tail.replace(/^[\s\])}.,;:–—-]+/, "").trim();
  return { id, rest };
}

/**
 * Take the other game's name off a stop title.
 *
 * A stop is filed once, by whoever hit it first, and the thread then collects every other title that
 * reaches the same code. Read under a second title it looks as though the map attached the wrong game,
 * so the drawer shows the symptom and says who raised it. `own` is the title IDs of the game being read:
 * a title naming any of those is left exactly as filed, because it is about that game too.
 */
export function foreignTitle(title: string, own: readonly string[]): ForeignTitle | null {
  if (!own.length) return null;
  const found = [...title.matchAll(TITLE_ID)];
  if (!found.length) return null;
  if (own.some((o) => found.some((f) => f[0] === o))) return null;
  return stopTitle(title);
}
