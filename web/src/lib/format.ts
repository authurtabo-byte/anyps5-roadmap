const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "10 Oct 2026", in the reader's own calendar.
 *
 * A bare "2026-10-10" is a calendar date, not an instant: it is formatted as written, because
 * running it through a timezone would turn 10 Oct into 9 Oct for anyone west of Greenwich.
 */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split("-").map(Number);
    return `${day} ${MONTHS[month - 1]} ${year}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** The reader's timezone, as a short name: "BST", "PDT", "GMT+2". */
function zoneName(d: Date): string {
  try {
    const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(d);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * "10 Oct 2026, 21:43 BST", in the reader's own time.
 *
 * The zone is named rather than assumed, because a screenshot of this page ends up somewhere
 * else and "21:43" alone means nothing to whoever reads it there.
 */
export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return "";
  const clock = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const zone = zoneName(d);
  return `${fmtDate(iso)}, ${clock}${zone ? ` ${zone}` : ""}`;
}

/**
 * "4 h ago" within a day, then the date.
 *
 * Recency is what a reader is judging up close — is this report from this morning or from last
 * month — and a date makes them do the subtraction. Past a day the exact date is the more useful
 * fact, so it switches back. Relative time needs no timezone at all.
 */
export function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = Date.parse(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 0) return fmtDate(iso); // a clock ahead of ours: show the date, do not guess
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return fmtDate(iso);
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en")} ${n === 1 ? one : many}`;
}

export function fmtSize(bytes: number): string {
  return bytes >= 1024 ? `${Math.round(bytes / 1024).toLocaleString("en")} KB` : `${bytes} bytes`;
}

export function pct(done: number, total: number): string {
  return total ? `${Math.round((100 * done) / total)}%` : "0%";
}
