# Python Libraries
from datetime import datetime
import json
import os
import pymysql
import requests
import sys
from urllib.parse import urlparse

# Local Includes
sys.path.append(os.path.dirname(os.path.realpath(__file__))) # ./
import Config

# The week playoffs start varies year to year. It's easiest to just add it manually each year here.
def is_playoff_week(week, year):
    if year == 2012:
        return week > 10
    elif year == 2013:
        return week > 20
    elif year == 2020:
        return week > 13
    elif year == 2021:
        return week > 25
    elif year == 2022 or year == 2023:
        return week > 22
    else:
        return week > 23

# We ignored consolation brackets until 2025, but starting then they get tracked separately.
def should_use_consolation_bracket(year):
    return year >= 2025

def get_main_consolation_game_ids(games_by_period):
    """
    Return the five games in the six-team, single-elimination consolation bracket. Ignore the
    separate 13th-14th consolation "bracket". 

    `games_by_period` is an iterable of (period_ordinal, game) pairs. Main-bracket
    entrants are the teams ranked 7th through 12th overall. A team eliminated in
    an earlier counted matchup cannot appear in another counted matchup; this
    naturally excludes the separate 9th-place game.
    """
    games_by_week = {}
    for period, game in games_by_period:
        if game.get("isConsolation"):
            games_by_week.setdefault(period, []).append(game)

    eliminated = set()
    selected = set()

    for period in sorted(games_by_week):
        week_losers = set()
        week_teams = set()
        for game in games_by_week[period]:
            away = game.get("away", {})
            home = game.get("home", {})
            away_rank = away.get("recordOverall", {}).get("rank")
            home_rank = home.get("recordOverall", {}).get("rank")
            if away_rank not in range(7, 13) or home_rank not in range(7, 13):
                continue

            away_id = str(away.get("id"))
            home_id = str(home.get("id"))
            if away_id in eliminated or home_id in eliminated:
                continue

            # A team can only play once in a round. Reject ambiguous scoreboards
            # instead of silently choosing an ordering-dependent bracket.
            if away_id in week_teams or home_id in week_teams:
                raise ValueError(f"Team appears in multiple main consolation games in period {period}")
            week_teams.update((away_id, home_id))

            result = game.get("homeResult")
            if not game.get("isFinalScore") or result not in ("WIN", "LOSE"):
                continue

            if result == "WIN":
                loser_id = away_id
            else:
                loser_id = home_id

            game_id = str(game.get("id"))
            selected.add(game_id)
            week_losers.add(loser_id)

        eliminated.update(week_losers)

    return selected

# Grabs the list of OTH leagues for the given year
# from the SQL database
def get_leagues_from_database(year, tier=None):
    DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
    cursor = DB.cursor()
    query = "SELECT id, name, year from Leagues where year=%s"
    params = [year]
    if tier != None:
        query += " and tier=%s"
        params.append(tier)
    cursor.execute(query, tuple(params))
    leagues = cursor.fetchall()
    cursor.close()

    return leagues

def bucket_time(minutes):
    dt = datetime.now()
    bucket_minute = (dt.minute // minutes) * minutes
    return dt.replace(minute=bucket_minute, second=0, microsecond=0)

telemetry = {}
def log_api_usage_telemetry(site):
    if site not in telemetry:
        telemetry[site] = {}

    bucket = bucket_time(minutes=1).strftime("%Y-%m-%d %H:%M:%S")
    if bucket not in telemetry[site]:
        telemetry[site][bucket] = 0

    telemetry[site][bucket] += 1

def flush_telemetry():
    global telemetry
    DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
    cursor = DB.cursor()

    query = "INSERT INTO ApiUsageTelemetry (time_bucket, site, count) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE count = count + VALUES(count)"

    for site, buckets in telemetry.items():
        for bucket, count in buckets.items():
            cursor.execute(query, (bucket, site, count))

    DB.commit()
    cursor.close()
    DB.close()

    telemetry = {}

# Gets the JSON data from the given fleaflicker.com/api call
headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
}
def make_api_call(link):
    # Log telemetry to ensure I'm not overusing APIs
    if "://" not in link:
        link = "https://" + link
    site = urlparse(link).netloc.replace("www.", "")
    log_api_usage_telemetry(site)
    flush_telemetry() # for now flush it every API call... should be able to tamper this down

    try:
        with requests.get(link, headers=headers, timeout=(5, 15)) as response:
            response.raise_for_status()
            data = response.json()
    except (requests.exceptions.RequestException, ValueError) as error:
        print(f"Error accessing {link}\n {error}")
        return {}

    return data

# TODO: This differs from the other Shared.py but is better
def WriteJsonFile(file, data):
    file = f"{Config.config['srcroot']}{file}"
    try:
        directory = "/".join(file.split("/")[:-1])
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Made new directory {directory}")

        # TODO: This differs from the other Shared.py version in that Config.config['srcroot'] has a trailing slash
        with open(file, "w") as f:
            json.dump(data, f, indent=4)

    except Exception as e:
        print(f"Error writing to {file}. {e}")
