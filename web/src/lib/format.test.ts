// Times are rendered in the reader's own zone. This checks the three things that are easy to get
// wrong: a bare calendar date must not shift by a day, an instant must carry its zone name, and
// relative time must give way to the date past a day.
import { describe, expect, it } from "vitest";
import { fmtDate, fmtTime, fmtWhen } from "./format";

describe("times", () => {
  it("leaves a bare calendar date alone, whatever the reader's zone", () => {
    // "2026-10-10" is a date, not midnight UTC: west of Greenwich that would render as 9 Oct.
    expect(fmtDate("2026-10-10")).toBe("10 Oct 2026");
  });

  it("renders an instant in local time and names the zone", () => {
    // The clock may be 12- or 24-hour depending on the locale, so only the shape is asserted.
    expect(fmtTime("2026-10-27T21:43:00Z")).toMatch(/^\d{1,2} Oct 2026, \d{1,2}:\d{2}( [AP]M)? \S+$/);
  });

  it("counts ago in minutes and hours, then falls back to the date", () => {
    const now = Date.now();
    const at = (minutes: number) => new Date(now - minutes * 60000).toISOString();
    expect(fmtWhen(at(0))).toBe("just now");
    expect(fmtWhen(at(5))).toBe("5 min ago");
    expect(fmtWhen(at(60 * 5))).toBe("5 h ago");
    // past a day the exact date is the more useful fact
    expect(fmtWhen(at(60 * 30))).not.toContain("ago");
    expect(fmtWhen(at(60 * 30))).toBe(fmtDate(at(60 * 30)));
  });
});
