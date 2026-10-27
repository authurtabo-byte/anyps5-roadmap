// The front page answers one question first: how far do PS5 games get on AnyPS5? A short hero with
// four numbers and the search, then every game with its stage and the one issue that stops it, then
// how to help.

import { useData } from "../data/load";
import { fmtWhen } from "../lib/format";
import { openItem } from "../lib/router";
import { NumberTicker } from "@/components/ui/number-ticker";
import { setParams, type Location } from "../lib/router";
import { AiStatus } from "../components/AiStatus";
import { HelpLinks } from "../components/HelpLinks";
import { SearchField } from "../components/ui";
import { GameList } from "./Games";

export function Home({ loc }: { loc: Location }) {
  const { model } = useData();
  const c = model.counts;
  const q = loc.under.params.get("q") ?? "";
  // [value, label, what moved in the last 24 hours]
  const t = model.today;
  const stats: [number, string, number][] = [
    [c.games, "games tracked", t.games],
    [c.reachMenus, "reach their menus", t.menus],
    [c.open, "open blockers", t.blockers],
    [c.inReview, "fixes in review", t.fixes],
  ];

  // What moved most recently: the last few stage changes across the newest snapshots, one card per
  // game so a game that moved twice does not fill the strip.
  const { snapshots } = useData();
  const moved: { game: string; name: string; stage: string; was?: string; date: string }[] = [];
  const seen = new Set<string>();
  for (const snap of snapshots) {
    for (const row of snap.rows) {
      if (row.type !== "stage" || !row.item || row.item.kind !== "game" || !row.stage) continue;
      if (seen.has(row.item.id)) continue;
      seen.add(row.item.id);
      moved.push({
        game: row.item.id,
        name: model.game(row.item.id)?.name ?? row.item.id,
        stage: row.stage,
        was: row.was,
        date: snap.date,
      });
      if (moved.length === 4) break;
    }
    if (moved.length === 4) break;
  }

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-text">
          <h1>How far PS5 games get on AnyPS5</h1>
          <p className="lede">
            AnyPS5 ports PS5 games to Linux and Windows. This map tracks every game reported on GitHub: how far it
            gets, and the open issue that stops it.
          </p>
          <p className="lede-note">
            It runs itself: a model reads the project's GitHub threads every few minutes and writes every status
            line, with no need for a pull request.
          </p>
        </div>
        <div className="hero-side">
      {moved.length > 0 && (
              <section className="news" aria-label="Recently moved">
                <p className="news-head">Recently moved</p>
              <ul className="news-grid">
                {moved.map((m) => (
                  <li key={m.game}>
                    <button
                      type="button"
                      className="news-card"
                      onClick={() => openItem({ kind: "game", id: m.game }, loc)}
                    >
                      <span className="news-name">{m.name}</span>
                      <span className="news-move">
                        {m.was && <span className="news-was">{m.was}</span>}
                        {m.was && <span className="news-arrow" aria-hidden="true">→</span>}
                        <span
                      className={`news-stage ${
                        m.was && model.stageRank(m.stage) < model.stageRank(m.was) ? "is-down" : ""
                      }`}
                    >
                      {m.stage}
                    </span>
                      </span>
                      <span className="news-when muted">{fmtWhen(m.date)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <dl className="hero-stats">
            {stats.map(([n, label, up]) => (
              <div key={label} className="stat">
                <dt>{label}</dt>
                <dd>
                  {n.toLocaleString("en")}
                  {up !== 0 && (
                    <span className="stat-up" title={`${up > 0 ? "+" : ""}${up} over the last 24 hours`}>
                      {up > 0 ? "+" : "−"}
                      <NumberTicker value={Math.abs(up)} className="text-[color:var(--ok)] dark:text-[color:var(--ok)] tracking-[-0.02em]" />
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="stat-note">
            {model.todaySource === "published"
              ? "Change over the last 24 hours"
              : "Change counted from report dates in this snapshot, until a day of records exists"}
          </p>
          <AiStatus />
        </div>
        <div className="hero-search">
          <SearchField
            large
            label="Find a game"
            placeholder="Name, title ID or error line"
            value={q}
            onChange={(v) => setParams(loc, { q: v || null })}
          />
        </div>
      </header>
      <GameList loc={loc} />
      <HelpLinks />
    </div>
  );
}
