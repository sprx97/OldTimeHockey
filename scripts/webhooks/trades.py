#!/usr/bin/env python3
"""Post newly recorded trades to a dedicated Discord webhook."""

import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SHARED_ROOT = PROJECT_ROOT / "shared"
sys.path.insert(0, str(SHARED_ROOT))

import Config
from Shared import get_leagues_from_database, get_owner_for_team, make_api_call

WEBHOOK_URLS = (
    Config.config["mods_webhook_url"],
    Config.config["hockey_general_webhook_url"],
)
POSTED_TRADES_FILE = Path(__file__).with_name("posted_trades.txt")

def get_posted_trade_ids():
    """Load trade IDs already posted, matching the legacy state file."""
    if not POSTED_TRADES_FILE.exists():
        return set()
    return {
        line.strip()
        for line in POSTED_TRADES_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    }

def get_new_trades(posted_trade_ids):
    """Return pending under-review trades using the original DiscordBot query."""
    new_trades = []
    for league in get_leagues_from_database(Config.config["year"]):
        data = make_api_call(
            f"https://www.fleaflicker.com/api/FetchTrades?sport=NHL&league_id={league['id']}&filter=TRADES_UNDER_REVIEW"
        )
        if data is None or "trades" not in data:
            continue

        for trade in data["trades"]:
            if str(trade["id"]) in posted_trade_ids:
                continue
            new_trades.append((str(trade["id"]), league, trade))

    return new_trades

def format_trade(league, trade):
    """Format a pending trade like the original DiscordBot embed."""
    season_year = Config.config["year"]
    embed = {
        "title": "Trade in " + league["name"],
        "url": f"https://www.fleaflicker.com/nhl/leagues/{league['id']}/trades/{trade['id']}",
        "fields": [],
    }
    team_number = 1
    for team in trade["teams"]:
        owner_data = get_owner_for_team(season_year, team["team"]["id"])
        owner = owner_data["FFname"] if owner_data else "Unknown owner"

        if "playersObtained" not in team:
            embed["fields"].append({
                "name": f"**{team['team']['name']} ({owner})**",
                "value": "No players going to this team -- please investigate.",
            })
            continue

        players = ""
        for player in team["playersObtained"]:
            players += player["proPlayer"]["nameFull"] + "\n"

        if "playersReleased" in team:
            for player in team["playersReleased"]:
                players += "*Dropping* " + player["proPlayer"]["nameFull"] + "\n"

        embed["fields"].append({
            "name": f"**[{team_number}] {team['team']['name']} ({owner})** gets",
            "value": players,
        })
        team_number += 1

    if "tentativeExecutionTime" in trade:
        timestamp = int(trade["tentativeExecutionTime"]) / 1000
        local_time = datetime.fromtimestamp(timestamp, tz=timezone.utc).astimezone(
            ZoneInfo("America/New_York")
        )
        embed["footer"] = {
            "text": "Processes " + local_time.strftime("%A, %B %d, %Y %H:%M ET")
        }

    return embed

def main():
    posted_trade_ids = get_posted_trade_ids()
    new_trades = get_new_trades(posted_trade_ids)
    for key, league, trade in new_trades:
        payload = {
            "embeds": [format_trade(league, trade)],
        }
        for webhook_url in WEBHOOK_URLS:
            response = requests.post(webhook_url, json=payload, timeout=30)
            response.raise_for_status()
        posted_trade_ids.add(key)
        POSTED_TRADES_FILE.write_text(
            "\n".join(sorted(posted_trade_ids)) + "\n",
            encoding="utf-8",
        )

if __name__ == "__main__":
    main()
