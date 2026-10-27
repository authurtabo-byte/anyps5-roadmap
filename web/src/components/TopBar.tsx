import { viewHref, type View } from "../lib/router";
import { useTheme } from "../lib/theme";
import { GitHubMark, ThemeIcon } from "./Icons";
import { External, ViewLink } from "./ui";
import { MAP_REPO } from "../lib/repo";

// Five places a visitor goes. The games list is the front page.
const NAV: { to: string; label: string; views: View[] }[] = [
  { to: viewHref("roadmap"), label: "Games", views: ["roadmap", "games"] },
  { to: viewHref("coverage"), label: "Coverage", views: ["coverage"] },
  { to: viewHref("blockers"), label: "Blockers", views: ["blockers"] },
  { to: viewHref("changes"), label: "Changes", views: ["changes"] },
  { to: viewHref("data"), label: "About", views: ["data"] },
];

const THEME_NAMES = { system: "System", light: "Light", dark: "Dark" } as const;

export function TopBar({ view }: { view: View }) {
  const [theme, cycle] = useTheme();
  return (
    <header className="bar">
      <div className="page bar-in">
        <ViewLink to="/" className="brand">
          AnyPS5 <span className="brand-sub">Blocker map</span>
        </ViewLink>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <ViewLink key={n.label} to={n.to} aria-current={n.views.includes(view) ? "page" : undefined}>
              {n.label}
            </ViewLink>
          ))}
        </nav>
        <div className="bar-end">
          <External
            href={`https://github.com/${MAP_REPO}`}
            className="icon-btn"
            aria-label="Source on GitHub"
            title="Source on GitHub"
          >
            <GitHubMark />
          </External>
          <button type="button" className="icon-btn" onClick={cycle} aria-label={`Theme: ${THEME_NAMES[theme]}`} title={`Theme: ${THEME_NAMES[theme]}`}>
            <ThemeIcon mode={theme} />
          </button>
        </div>
      </div>
    </header>
  );
}
