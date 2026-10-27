import { describe, expect, it } from "vitest";
import { canonical, itemHref, parsePath, viewHref } from "./router";

describe("routes", () => {
  it("parses views, items and filters", () => {
    const r = parsePath("/games?stage=Presents&q=unity");
    expect(r.view).toBe("games");
    expect(r.item).toBeNull();
    expect(r.params.get("stage")).toBe("Presents");
    expect(parsePath("/blockers/1578~libSceOpusDec.prx").item).toEqual({
      kind: "blocker",
      id: "1578~libSceOpusDec.prx",
    });
    expect(parsePath("/games/PPSA01746").item).toEqual({ kind: "game", id: "PPSA01746" });
    expect(parsePath("/").view).toBe("roadmap");
    expect(parsePath("/nowhere").view).toBe("roadmap");
  });

  it("still parses the old hash links, so nothing already shared breaks", () => {
    expect(parsePath("#/games?stage=Presents").view).toBe("games");
    expect(parsePath("#/games/PPSA01746").item).toEqual({ kind: "game", id: "PPSA01746" });
  });

  it("keeps the anchors of the classic page and of older feed items working", () => {
    expect(canonical("#b-2548")).toBe("/blockers/2548");
    expect(canonical("#g-PPSA01746")).toBe("/games/PPSA01746");
    expect(canonical("#fix-next")).toBe("/blockers");
    expect(canonical("#coverage")).toBe("/coverage");
    expect(canonical("#top")).toBe("/");
  });

  it("writes links that parse back to the same place", () => {
    const href = itemHref({ kind: "blocker", id: "pr-2106" });
    expect(parsePath(href).item).toEqual({ kind: "blocker", id: "pr-2106" });
    expect(viewHref("blockers", { status: "review", q: "", area: null })).toBe("/blockers?status=review");
    expect(viewHref("roadmap")).toBe("/");
    expect(itemHref({ kind: "game", id: "PPSA01746" })).toBe("/games/PPSA01746");
  });
});
