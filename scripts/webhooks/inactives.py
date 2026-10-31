#!/usr/bin/env python3
"""Copy of OTH's inactive-team check, posted to a Discord webhook."""

import sys
from datetime import datetime, timezone
from pathlib import Path

from lxml import etree
import requests

# Use this project's shared configuration and database/API helpers.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
SHARED_ROOT = PROJECT_ROOT / "shared"
sys.path.insert(0, str(SHARED_ROOT))

import Config
from Shared import get_leagues_from_database, log_api_usage_telemetry, make_api_call

MIN_INACTIVE_DAYS = 7
WEBHOOK_URL = Config.config["mods_webhook_url"]

def find_inactives():
    """Return the same inactive-team messages produced by OTH.check_inactives."""
    messages = []
    leagues = get_leagues_from_database(Config.config["year"])

    for league in leagues:
        for team in make_api_call(
            f"https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league['id']}"
        )["divisions"][0]["teams"]:
            team_url = f"https://www.fleaflicker.com/nhl/leagues/{league['id']}/teams/{team['id']}"

            if "owners" not in team:
                messages.append(f"**{league['name']}**: *Unowned team: {team['name']}* {team_url}")
                continue

            log_api_usage_telemetry("fleaflicker.com")
            headers = {
                "Cache-Control": "must-revalidate, max-age=0",
                "Pragma": "no-cache",
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html",
            }
            try:
                response = requests.get(team_url, headers=headers)
                response.raise_for_status()
                tree = etree.HTML(response.content)
                datetime_values = tree.xpath("//relative-time/@datetime") if tree is not None else []
                if not datetime_values:
                    messages.append(f"**{league['name']}**: *No last lineup change found for {team['name']}* {team_url}")
                    continue

                changed_at = datetime.fromisoformat(datetime_values[0].replace("Z", "+00:00"))
                if changed_at.tzinfo is None:
                    changed_at = changed_at.replace(tzinfo=timezone.utc)
            except (requests.RequestException, ValueError):
                continue

            days_since_change = (datetime.now(timezone.utc) - changed_at).days
            if days_since_change > MIN_INACTIVE_DAYS:
                owner = team["owners"][0]["displayName"]
                messages.append(
                    f"**{league['name']}**: *Owner {owner} no lineup changes in last {days_since_change} days* {team_url}"
                )

    return messages


def split_messages(messages, limit=2000):
    """Pack report lines into Discord's 2000-character message limit."""
    chunks = []
    current = ""
    for message in messages:
        line = message + "\n"
        if current and len(current) + len(line) > limit:
            chunks.append(current.rstrip())
            current = ""
        while len(line) > limit:
            chunks.append(line[:limit])
            line = line[limit:]
        current += line
    if current:
        chunks.append(current.rstrip())
    return chunks


def main():
    messages = find_inactives()
    chunks = split_messages(messages or ["No inactive or unowned teams found."])
    for chunk in chunks:
        response = requests.post(WEBHOOK_URL, json={"content": chunk, "flags": 4}, timeout=30)
        response.raise_for_status()

if __name__ == "__main__":
    main()
