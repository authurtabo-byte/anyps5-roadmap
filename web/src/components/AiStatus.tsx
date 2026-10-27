// A small, honest indicator that the writing half of the map is alive.
//
// Two files feed it. `ai-live.json` is the refresh heartbeat — what it is doing right now, written
// by the service that refreshes the map, as each step begins. `ai-status.json` is the result of the last writing pass:
// how many games carry a written line, and whether those lines came from the model or fell back
// to the map's own facts.
//
// Neither file names a provider or a model: who runs the model is the operator's business, not
// the reader's. The indicator only says whether the work is happening.
//
// "From the facts" is the fallback: when the provider is unreachable, every game still gets a
// line built from the map itself, so the page never breaks. Saying so is the point — silence
// would make a broken pipeline look like a working one.

import { useEffect, useState, type CSSProperties } from "react";
import { useJson } from "../data/load";
import { StatusDot } from "@/components/ui/status-dot";

interface AiStatusDoc {
  generated_at: string;
  /** When the writing pass last ran, even if it wrote nothing. */
  checked_at?: string;
  counts: { games: number; model_lines: number; fact_lines: number; errors: number };
  api: { calls: number; failures: number };
}

interface AiLiveDoc {
  phase: string;
  detail: string;
  /** A sentence the model wrote about the step, when it had something to say. */
  line?: string;
  started_at: string;
  updated_at: string;
}

/** What each phase is called in plain words. */
const PHASE: Record<string, string> = {
  starting: "starting up",
  checking: "checking GitHub",
  reading: "reading upstream",
  extracting: "reading new comments",
  reviewing: "ruling on claimed stages",
  writing: "writing status lines",
  idle: "waiting",
};

function ago(iso: string): { text: string; minutes: number } {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return { text: "unknown", minutes: Infinity };
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return { text: "just now", minutes };
  if (minutes < 60) return { text: `${minutes} min`, minutes };
  const hours = Math.round(minutes / 60);
  if (hours < 48) return { text: `${hours} h`, minutes };
  return { text: `${Math.round(hours / 24)} d`, minutes };
}

/** "just now", or "12 min ago" — the word "ago" is wrong after "just now". */
function since(iso: string): string {
  const a = ago(iso);
  return a.minutes < 1 ? "just now" : `${a.text} ago`;
}

/**
 * What the indicator should say, given the heartbeat and the last writing pass.
 *
 * Eight minutes is the line: a phase that is running but has not written a line for that long has
 * stopped moving, and saying "live" about it is worse than saying nothing. Exported so the rule can
 * be tested without a browser.
 */
export function aiState(
  beat: { phase: string; updated_at: string } | null,
  done: { generated_at: string; counts: { fact_lines: number } } | null,
  now: number = Date.now(),
): { phase: "off" | "working" | "stalled" | "stale" | "ok" | "degraded"; minutes: number } {
  const minutes = (iso: string | undefined): number => {
    const then = iso ? Date.parse(iso) : NaN;
    return Number.isNaN(then) ? Infinity : Math.max(0, Math.round((now - then) / 60000));
  };
  if (!done) return { phase: "off", minutes: Infinity };
  const beatAge = beat ? minutes(beat.updated_at) : Infinity;
  const running = !!beat && beat.phase !== "idle" && beat.phase !== "starting";
  if (running && beatAge < 8) return { phase: "working", minutes: beatAge };
  if (running) return { phase: "stalled", minutes: beatAge };
  if (minutes(done.generated_at) > 240) return { phase: "stale", minutes: minutes(done.generated_at) };
  return { phase: done.counts.fact_lines === 0 ? "ok" : "degraded", minutes: minutes(done.generated_at) };
}

export function AiStatus() {
  // Both poll, so the line changes on its own while someone is reading the page.
  const live = useJson<AiLiveDoc>("ai-live.json", 30_000);
  const done = useJson<AiStatusDoc>("ai-status.json", 60_000);

  // Re-render once a minute so "3 min" becomes "4 min" without new data.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  if (done.status === "loading") return null;

  // Working means the heartbeat names a running phase and is recent enough to believe. Eight minutes
  // is the same line the operator screen draws: the heartbeat is written as each step begins and as each
  // log line arrives, so a running phase with nothing written for that long has stopped moving.
  const beat = live.status === "ready" ? live.data : null;

  const d = done.status === "ready" ? done.data : null;
  const allFromModel = !!d && d.counts.fact_lines === 0;
  const judged = aiState(beat, d as unknown as { generated_at: string; counts: { fact_lines: number } } | null);
  const state = judged.phase;
  const working = state === "working";
  const stalled = state === "stalled";

  let text: string;
  if (working && beat) {
    // The model writes the sentence; the fixed wording is only the fallback for when it had
    // nothing to say.
    const said = beat.line?.trim();
    // A step that is running is happening now; "1 min ago" is the clock of the last finished step.
    text = said ? `${said} · live` : `AI is ${PHASE[beat.phase] ?? beat.phase}${beat.detail ? ` — ${beat.detail}` : ""} · live`;
  } else if (stalled && beat) {
    // The step is still the current one, but nothing has been written for a while: say that plainly
    // instead of repeating the phase with "live" beside it.
    text = `Step stalled: ${PHASE[beat.phase] ?? beat.phase} — last write ${since(beat.updated_at)}`;
  } else if (!d) {
    text = "Status lines are not available in this build";
  } else if (state === "stale") {
    text = `AI last wrote a status line ${since(d.generated_at)}`;
  } else if (allFromModel) {
    text = `AI wrote ${d.counts.model_lines} status lines · last one ${since(d.generated_at)}`;
  } else {
    text = `AI wrote ${d.counts.model_lines} status lines, ${d.counts.fact_lines} built from the map's own facts · last one ${since(d.generated_at)}`;
  }

  // The dot is the component set's status dot: the ripple means a step is running right now, and a
  // steady dot means the last pass finished. Its palette is pointed at this site's tokens so a live
  // dot is the same green as a fixed blocker.
  const dot =
    working ? (
      <StatusDot state="BUILDING" size="sm" />
    ) : state === "ok" ? (
      <StatusDot state="READY" size="sm" style={{ "--status-dot-success": "var(--ok)" } as CSSProperties} />
    ) : state === "degraded" || state === "stalled" ? (
      <StatusDot tone="warning" size="sm" />
    ) : (
      <StatusDot tone="neutral" size="sm" style={{ "--status-dot-neutral": "var(--text-3)" } as CSSProperties} />
    );

  return (
    <p className="live-status" data-state={state}>
      {dot}
      <span>{text}</span>
    </p>
  );
}
