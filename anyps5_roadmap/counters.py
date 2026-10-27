"""The four numbers on the map, and what they did, and what they did over the last twenty-four hours.

Every build records the four totals next to the map. The published delta is the current number minus
the newest record that is at least a day old; until a day of records exists there is no baseline, so
nothing is published and the page shows no counter rather than an invented one.

The record lives in the cache directory, on the volume, so a deploy does not reset the day.
"""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path

WINDOW = dt.timedelta(hours=24)
KEEP = dt.timedelta(days=8)
KEYS = ("games", "menus", "blockers", "fixes")
STAMP = "%Y-%m-%dT%H:%M:%SZ"


def _parse(value: str | None) -> dt.datetime | None:
    try:
        return dt.datetime.strptime(value or "", STAMP).replace(tzinfo=dt.UTC)
    except ValueError:
        return None


def load(path: Path) -> list[dict]:
    try:
        doc = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    entries = doc.get("entries") if isinstance(doc, dict) else None
    return [e for e in entries or [] if isinstance(e, dict) and e.get("at")]


def save(path: Path, entries: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"schema_version": 1, "entries": entries}, indent=1) + "\n", encoding="utf-8")


def update(path: Path, now: dt.datetime, current: dict[str, int]) -> dict | None:
    """Record today's totals and return the change since the same time yesterday, or None."""
    entries = load(path)
    stamp = now.strftime(STAMP)
    baseline = None
    for entry in sorted(entries, key=lambda e: e["at"]):
        at = _parse(entry["at"])
        if at is not None and now - at >= WINDOW:
            baseline = entry  # the newest one that is still at least a day old

    entries.append({"at": stamp, **{k: int(current.get(k) or 0) for k in KEYS}})
    kept = [e for e in entries if (at := _parse(e["at"])) is not None and now - at <= KEEP]
    save(path, kept[-96:])  # four days of five-minute builds is enough context

    if baseline is None:
        return None
    return {k: int(current.get(k) or 0) - int(baseline.get(k, current.get(k) or 0)) for k in KEYS}
