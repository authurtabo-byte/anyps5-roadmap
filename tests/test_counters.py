"""The front page's 24-hour counters: a delta needs a record from a day ago."""

import datetime as dt
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from anyps5_roadmap import counters  # noqa: E402

NOW = dt.datetime(2026, 10, 27, 18, 0, tzinfo=dt.UTC)


def totals(games=400, menus=95, blockers=142, fixes=35):
    return {"games": games, "menus": menus, "blockers": blockers, "fixes": fixes}


class DayChange(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.path = Path(self.dir.name) / "stats-history.json"

    def tearDown(self):
        self.dir.cleanup()

    def test_the_first_build_has_no_baseline_and_publishes_nothing(self):
        self.assertIsNone(counters.update(self.path, NOW, totals()))

    def test_a_record_from_yesterday_gives_the_change(self):
        counters.update(self.path, NOW - dt.timedelta(hours=30), totals(games=393, menus=89, blockers=138, fixes=36))
        delta = counters.update(self.path, NOW, totals())
        self.assertEqual(delta, {"games": 7, "menus": 6, "blockers": 4, "fixes": -1})

    def test_a_record_from_an_hour_ago_is_not_a_baseline(self):
        counters.update(self.path, NOW - dt.timedelta(hours=1), totals(games=399))
        self.assertIsNone(counters.update(self.path, NOW, totals()))

    def test_the_newest_old_record_wins(self):
        counters.update(self.path, NOW - dt.timedelta(days=3), totals(games=380))
        counters.update(self.path, NOW - dt.timedelta(hours=25), totals(games=395))
        delta = counters.update(self.path, NOW, totals(games=400))
        self.assertEqual(delta["games"], 5)

    def test_records_older_than_a_week_are_dropped(self):
        counters.update(self.path, NOW - dt.timedelta(days=30), totals())
        counters.update(self.path, NOW, totals())
        kept = json.loads(self.path.read_text(encoding="utf-8"))["entries"]
        self.assertEqual(len(kept), 1)


if __name__ == "__main__":
    unittest.main()
