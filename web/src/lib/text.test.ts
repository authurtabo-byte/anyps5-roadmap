import { describe, expect, it } from "vitest";
import { fold, foreignTitle, matchesTerms, searchTerms } from "./text";

describe("fold", () => {
  it("lowers case and drops accents", () => {
    expect(fold("Ghost of Yōtei")).toBe("ghost of yotei");
    expect(fold("POKÉMON")).toBe("pokemon");
    expect(fold("PPSA01325 #2106")).toBe("ppsa01325 #2106");
  });

  it("leaves marks of other scripts alone", () => {
    expect(fold("ガ")).not.toBe(fold("カ"));
    expect(fold("हिंदी").normalize("NFC")).toBe("हिंदी");
  });
});

describe("searchTerms", () => {
  it("splits a query into folded words and ignores extra spaces", () => {
    expect(searchTerms("  Yōtei   GHOST ")).toEqual(["yotei", "ghost"]);
    expect(searchTerms("   ")).toEqual([]);
  });

  it("keeps a quoted part as one term", () => {
    expect(searchTerms('"Descriptor 6 is  not" poll')).toEqual(["descriptor 6 is  not", "poll"]);
    expect(searchTerms('"" "unclosed quote')).toEqual(["unclosed", "quote"]);
  });
});

describe("matchesTerms", () => {
  const haystack = fold("Ghost of Yōtei PPSA12345 pr #2106");

  it("needs every word, in any order", () => {
    expect(matchesTerms(haystack, searchTerms("yotei ghost"))).toBe(true);
    expect(matchesTerms(haystack, searchTerms("PR 2106"))).toBe(true);
    expect(matchesTerms(haystack, searchTerms("ghost tsushima"))).toBe(false);
  });

  it("matches everything for an empty query and still finds partial IDs", () => {
    expect(matchesTerms(haystack, searchTerms(""))).toBe(true);
    expect(matchesTerms(haystack, searchTerms("12345"))).toBe(true);
  });
});

describe("foreignTitle", () => {
  const own = ["PPSA10112"];

  it("takes another game's name off the front and keeps the symptom", () => {
    expect(
      foreignTitle(
        'Palworld (PPSA23126): abort at compute shader 0x15c1486e00, "storing storage image results"',
        own,
      ),
    ).toEqual({ id: "PPSA23126", rest: 'abort at compute shader 0x15c1486e00, "storing storage image results"' });
  });

  it("cuts at the first colon, so a platform in the middle goes with the name", () => {
    expect(foreignTitle("ASTRO BOT (PPSA21564) on Windows / AMD RX 6600 XT: GPU hang in the first frames", own)).toEqual({
      id: "PPSA21564",
      rest: "GPU hang in the first frames",
    });
  });

  it("drops the dash when there is no colon", () => {
    expect(foreignTitle("The King is Watching (01.000.300) PPSA34959 - Crash with AGC graphics memory error", own)).toEqual({
      id: "PPSA34959",
      rest: "Crash with AGC graphics memory error",
    });
  });

  it("leaves a title that names this game anywhere, even after another one", () => {
    expect(
      foreignTitle("Queue 0x20 WAIT_REG_MEM times out (Kena PPSA01746, Coral Island PPSA17226)", ["PPSA17226"]),
    ).toBeNull();
  });

  it("leaves a stop filed for this game alone", () => {
    expect(foreignTitle("SILENT HILL: The Short Message (PPSA10112) stops at the intro", own)).toBeNull();
  });

  it("leaves a title with no ID alone", () => {
    expect(foreignTitle("AGC: a fragment shader's T# is read on the CPU", own)).toBeNull();
    expect(foreignTitle("anything", [])).toBeNull();
  });
});
