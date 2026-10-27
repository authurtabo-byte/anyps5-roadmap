// One level down from the games: what the stages and the ranking mean, how to help, and the
// numbers behind this snapshot. The generated files are documented in the repository rather than
// listed here; the page links the two the app itself reads.

import { useData } from "../data/load";
import { fmtTime, plural } from "../lib/format";
import { HelpLinks } from "../components/HelpLinks";
import { viewHref, type Location } from "../lib/router";
import { ARCHIVE_REPO, MAP_REPO, UPSTREAM_REPO } from "../lib/repo";
import { ArrowIcon } from "../components/Icons";
import { External, ItemLink, StageMeter, ViewHead, ViewLink } from "../components/ui";

export function About({ loc }: { loc: Location }) {
  const { model } = useData();
  const doc = model.doc;
  const s = doc.stats;
  const gaps = doc.gaps ?? [];
  const total = model.stages.length;
  const review = doc.identity?.review ?? [];
  const numbers: [string, number | undefined][] = [
    ["Issues read", s.issues_scanned],
    ["Pull requests read", s.prs_scanned],
    ["Discussions read", s.discussions_scanned as number | undefined],
    ["Games", s.games as number | undefined],
    ["Title IDs", s.titles],
    ["Games with a cover", s.games_with_image as number | undefined],
    ["Stage reviews", s.stage_reviews],
    ["Curated blockers", s.blockers_curated as number | undefined],
    ["Evidence items", s.evidence_items as number | undefined],
  ];

  return (
    <div className="view about">
      <ViewHead title="About this map">
        A community map of how far PS5 games get on AnyPS5, built from public issues and pull requests in{" "}
        <External href={`https://github.com/${model.repo}`}>{model.repo}</External>. Every stage and every blocker links
        its source.
      </ViewHead>

      <section className="section prose" aria-labelledby="h-stages">
        <h2 id="h-stages">Stages</h2>
        <p>Each game shows the furthest stage confirmed on AnyPS5 main, from lowest to highest.</p>
        <ol className="stage-defs stage-table">
          {model.ladder.map((r, i) => (
            <li key={r.stage.name}>
              <StageMeter rank={i} total={total} />
              <span className="sd-name">{r.stage.name}</span>
              <span className="sd-def">
                {r.stage.meaning}
                {r.heldBy && (
                  <span className="sd-held">
                    {" "}
                    Most games here stop first at{" "}
                    <ItemLink item={{ kind: "blocker", id: r.heldBy.row.id }} loc={loc} className="mono">
                      {r.heldBy.row.ref}
                    </ItemLink>
                    .
                  </span>
                )}
              </span>
              <span className="sd-n">{plural(r.games, "game")}</span>
            </li>
          ))}
        </ol>
        <p>
          A stage counts when it was reached on main, or on main plus pull requests that are merged now. Menus and
          higher, the stages people share screenshots of, count only after someone checks the report. Until then the
          game shows the report as an unverified claim. A game that gets further with pull requests that are still open,
          or with local patches, shows that too, as its stage off main, with the pull requests it needs; it moves up by
          itself once they are merged.
        </p>
      </section>

      {model.tags.length > 0 && (
        <section className="section prose" aria-labelledby="h-tags">
          <h2 id="h-tags">Tags</h2>
          <p>
            A tag describes a title: 2D or 3D, a genre such as Shooter or Platformer, or App for anything that is not a
            game. Filter the game list by one with the Tag menu.
          </p>
          <p>
            A tag is shown only when a public source names it, and each game links its sources. They are the genres on
            Wikidata and the PlayStation Store, the user tags on SteamSpy, and for homebrew its own README. A title that
            no source describes has no tags.
          </p>
        </section>
      )}

      <section className="section prose" aria-labelledby="h-identity">
        <h2 id="h-identity">Games and title IDs</h2>
        <p>
          A game is listed once, with every title ID it ships under: its US, European and Asian releases, and the PS4
          version where someone tried one. Reports on any of them count for the game, and a search for any of its IDs or
          for a short form of its name, such as GTA V for Grand Theft Auto V, finds it.
        </p>
        <p>
          Two title IDs are one game when the PlayStation Store lists them under one product page, or when their names
          match once spelling, symbols, editions and abbreviations are set aside. Names that only look alike are never
          joined by themselves; they wait for a person to check, below. Each game takes its name from the PlayStation
          Store unless a person corrected it.
        </p>
        <p>
          Covers come from the game&rsquo;s PlayStation Store page, or from Steam, and load from their servers. They
          belong to their publishers. A game without one shows its initials.
        </p>
      </section>

      <section className="section prose" aria-labelledby="h-ranking">
        <h2 id="h-ranking">Blockers and the ranking</h2>
        <p>
          A blocker is an open issue or pull request in AnyPS5 that stops at least one game. Each one scores 3 points for
          every game it is the only stop of, 2 for every game it stops first, and 1 for every game that hits it at all.
          The top of the ranking is where a fix moves the most games.
        </p>
        <p>
          <ViewLink to={viewHref("blockers")} className="go">
            See the ranking <ArrowIcon />
          </ViewLink>
        </p>
      </section>

      <HelpLinks />

      <section className="section prose" aria-labelledby="h-coverage">
        <h2 id="h-coverage">Coverage</h2>
        <p>How much of the PS5's system libraries, GPU shader instructions and GPU command packets AnyPS5 implements.</p>
        <p>
          <ViewLink to={viewHref("coverage")} className="go">
            Open the coverage map <ArrowIcon />
          </ViewLink>
        </p>
      </section>

      <section className="section prose" aria-labelledby="h-source">
        <h2 id="h-source">Where this lives</h2>
        <p>
          The map is a community project, not an official AnyPS5 page. The emulator it tracks is{" "}
          <External href={`https://github.com/${UPSTREAM_REPO}`}>{UPSTREAM_REPO}</External>; every stage, blocker and
          link here is read from that repository's public issues, pull requests and discussions.
        </p>
        <p>
          The site's own source, the generator that builds this snapshot and the issue forms for a wrong stage or a
          missing blocker are all in <External href={`https://github.com/${MAP_REPO}`}>{MAP_REPO}</External>. The
          working files a visitor does not need — the map as JSON, the ranking as Markdown — live there rather than
          here.
        </p>
        <p>
          The code began as <External href={`https://github.com/${ARCHIVE_REPO}`}>{ARCHIVE_REPO}</External>, which
          was archived in October 2026; this fork carries it on. Licensed MIT.
        </p>
        <p>
          <External href={`https://github.com/${MAP_REPO}/issues/new/choose`} className="go">
            Report a wrong stage or blocker <ArrowIcon />
          </External>
        </p>
      </section>

      <section className="section" aria-labelledby="h-numbers">
        <div className="section-head">
          <h2 id="h-numbers">This snapshot</h2>
          <span className="muted small">{fmtTime(doc.generated_at)}</span>
        </div>
        <dl className="numbers">
          {numbers
            .filter(([, n]) => typeof n === "number")
            .map(([label, n]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{n!.toLocaleString("en")}</dd>
              </div>
            ))}
        </dl>
      </section>

      {gaps.length > 0 && (
        <details className="disclose">
          <summary>
            <span className="disclose-title">
              Known gaps in the data <span className="h-n">{gaps.length}</span>
            </span>
          </summary>
          <ul className="gaps">
            {gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </details>
      )}

      {review.length > 0 && (
        <details className="disclose">
          <summary>
            <span className="disclose-title">
              Possible duplicates to check <span className="h-n">{review.length}</span>
            </span>
          </summary>
          <ul className="gaps">
            {review.map((r) => (
              <li key={r.title_ids.join("+")}>
                {r.names.filter(Boolean).join(" / ")}{" "}
                <span className="mono muted">({r.title_ids.join(", ")})</span>
                <span className="muted">. {r.note}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {(doc.not_blockers ?? []).length > 0 && (
        <details className="disclose">
          <summary>
            <span className="disclose-title">
              Issues kept out of the ranking <span className="h-n">{doc.not_blockers!.length}</span>
            </span>
          </summary>
          <ul className="gaps">
            {doc.not_blockers!.map((n) => (
              <li key={n.issue}>
                <External href={`https://github.com/${model.repo}/issues/${n.issue}`} className="mono">
                  #{n.issue}
                </External>{" "}
                {n.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
