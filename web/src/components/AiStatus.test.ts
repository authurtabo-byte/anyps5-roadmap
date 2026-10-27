import { describe, expect, it } from "vitest";
import { aiState } from "./AiStatus";

const NOW = Date.parse("2026-10-27T18:00:00Z");
const at = (minutesAgo: number) => new Date(NOW - minutesAgo * 60_000).toISOString();
const done = (minutesAgo: number, factLines = 0) => ({
  generated_at: at(minutesAgo),
  counts: { fact_lines: factLines },
});

describe("the front page's status line", () => {
  it("says working while a step is reporting", () => {
    expect(aiState({ phase: "extracting", updated_at: at(2) }, done(3), NOW).phase).toBe("working");
  });

  it("says stalled once a running step goes quiet for eight minutes", () => {
    expect(aiState({ phase: "extracting", updated_at: at(7) }, done(3), NOW).phase).toBe("working");
    expect(aiState({ phase: "extracting", updated_at: at(9) }, done(3), NOW).phase).toBe("stalled");
  });

  it("treats an idle loop as finished work, not as a stall", () => {
    expect(aiState({ phase: "idle", updated_at: at(30) }, done(2), NOW).phase).toBe("ok");
  });

  it("calls a writing pass older than four hours stale", () => {
    expect(aiState({ phase: "idle", updated_at: at(200) }, done(300), NOW).phase).toBe("stale");
  });

  it("says degraded when lines had to fall back to facts", () => {
    expect(aiState({ phase: "idle", updated_at: at(5) }, done(2, 4), NOW).phase).toBe("degraded");
  });

  it("is off when there is no status file at all", () => {
    expect(aiState(null, null, NOW).phase).toBe("off");
  });
});
