#!/usr/bin/env python3
"""Export all NHL goalie starts for a season to CSV using the NHL Stats API."""

import argparse
import csv
import json
import sys
from datetime import date
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_URL = "https://api.nhle.com/stats/rest/en/goalie/summary"
PAGE_SIZE = 1000
CSV_COLUMNS = [
    "date",
    "goalie",
    "team",
    "opponent",
    "minutes",
    "wins",
    "losses",
    "otlosses",
    "shotsagainst",
    "saves",
    "goalsagainst",
    "shutouts",
]


def season_id(value):
    """Convert a season starting year (such as 2023) to an NHL season ID."""
    try:
        year = int(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("year must be a four-digit starting year, such as 2023") from exc

    if len(value) != 4 or not 1900 <= year <= date.today().year:
        raise argparse.ArgumentTypeError("year must be a four-digit starting year, such as 2023")
    return year * 10000 + (year + 1)


def fetch_page(season, game_type, start):
    params = {
        "isAggregate": "false",
        "isGame": "true",
        "sort": "gameDate",
        "start": start,
        "limit": PAGE_SIZE,
        "cayenneExp": f"seasonId={season} and gameTypeId={game_type}",
    }
    request = Request(f"{API_URL}?{urlencode(params)}", headers={"User-Agent": "OldTimeHockey goalie start exporter"})
    with urlopen(request, timeout=30) as response:
        payload = json.load(response)

    if "data" not in payload or "total" not in payload:
        raise RuntimeError("NHL Stats API returned an unexpected response")
    return payload["data"], payload["total"]


def fetch_season(season, game_types):
    starts = []
    for game_type in game_types:
        offset = 0
        total = None
        while total is None or offset < total:
            rows, total = fetch_page(season, game_type, offset)
            if not rows and offset < total:
                raise RuntimeError(f"NHL Stats API returned no rows at offset {offset} of {total}")
            starts.extend(row for row in rows if row.get("gamesStarted", 0) == 1)
            offset += len(rows)
    return starts


def minutes_played(seconds):
    """Format API timeOnIce seconds as a conventional M:SS game-log value."""
    minutes, remainder = divmod(int(seconds or 0), 60)
    return f"{minutes}:{remainder:02d}"


def write_csv(rows, output):
    rows.sort(key=lambda row: (row.get("gameDate", ""), row.get("gameId", 0), row.get("teamAbbrev", "")))
    with open(output, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "date": row.get("gameDate", ""),
                    "goalie": row.get("goalieFullName", ""),
                    "team": row.get("teamAbbrev", ""),
                    "opponent": row.get("opponentTeamAbbrev", ""),
                    "minutes": minutes_played(row.get("timeOnIce")),
                    "wins": row.get("wins", 0),
                    "losses": row.get("losses", 0),
                    "otlosses": row.get("otLosses", 0),
                    "shotsagainst": row.get("shotsAgainst", 0),
                    "saves": row.get("saves", 0),
                    "goalsagainst": row.get("goalsAgainst", 0),
                    "shutouts": row.get("shutouts", 0),
                }
            )


def main():
    parser = argparse.ArgumentParser(description="Export every NHL regular-season goalie start to CSV.")
    parser.add_argument("year", type=season_id, help="four-digit season starting year, such as 2023")
    args = parser.parse_args()
    season = args.year
    year = season // 10000
    output = f"{year}_goalie_starts.csv"

    try:
        rows = fetch_season(season, (2,))
        write_csv(rows, output)
    except (HTTPError, URLError, TimeoutError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"Failed to download goalie starts: {exc}", file=sys.stderr)
        return 1

    print(f"Wrote {len(rows)} goalie starts to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
