// Search relevance: where a term was found decides the order, not just whether it was found.

import { describe, expect, it } from "vitest";
import { searchTerms } from "../lib/text";
import { gameList, matchScore } from "./lists";
import type { GameRow } from "./model";

const game = (aliases: string[] = []) => ({ aliases }) as unknown as GameRow["game"];
const row = (over: Partial<GameRow>) =>
  ({ name: "", ids: ["PPSA00000"], tags: [], game: game(), firstStop: null, ...over }) as unknown as GameRow;

const gtaV = row({ name: "Grand Theft Auto V", ids: ["PPSA04264"], game: game(["GTA V", "GTA5"]) });
const minecraft = row({
  name: "Minecraft",
  ids: ["PPSA17221"],
  firstStop: {
    title: "GTA V (PPSA04264) stops before the menu",
    blocker: { signature: "" },
  } as unknown as GameRow["firstStop"],
});

describe("matchScore", () => {
  it("ranks a name match above a mention inside another game's stop", () => {
    const name = matchScore(gtaV, searchTerms("gta"))!;
    const mention = matchScore(minecraft, searchTerms("gta"))!;
    expect(name).toBeGreaterThan(mention);
  });

  it("finds a game by a title ID fragment", () => {
    expect(matchScore(gtaV, searchTerms("04264"))).toBeGreaterThan(0);
  });

  it("needs every term of a query", () => {
    expect(matchScore(gtaV, searchTerms("gta theft"))).toBeGreaterThan(0);
    expect(matchScore(gtaV, searchTerms("gta minecraft"))).toBeNull();
  });

  it("puts a word start above a match inside a word", () => {
    const inside = row({ name: "Outgta" });
    expect(matchScore(gtaV, searchTerms("gta"))).toBeGreaterThan(matchScore(inside, searchTerms("gta"))!);
  });

  it("scores an exact name above a prefix", () => {
    const exact = row({ name: "Stray" });
    const prefix = row({ name: "Strayed" });
    expect(matchScore(exact, searchTerms("stray"))).toBeGreaterThan(matchScore(prefix, searchTerms("stray"))!);
  });

  it("treats a whole title ID as a lookup, not a search", () => {
    const rows = [gtaV, minecraft];
    expect(gameList(rows, { stage: "all", q: "PPSA04264" }).map((g) => g.name)).toEqual(["Grand Theft Auto V"]);
    // a fragment still searches, so "04264" finds it alongside anything else that mentions it
    expect(gameList(rows, { stage: "all", q: "04264" }).length).toBeGreaterThanOrEqual(1);
  });
});
