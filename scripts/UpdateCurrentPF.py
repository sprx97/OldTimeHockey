# Python Includes
import os
import pymysql # sql queries
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ./../
from shared.Shared import *
from shared import Config

years_to_update = [] # Can manually seed if necessary

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
years_to_update.append(int(f.readline().strip()))
week = int(f.readline().strip())

def updateCurrentPF(league, year):
    # Track which teams in this division we've updated, because for playoffs, teams on bye don't show up in FetchLeagueScoreboard
    tracked = []

    # "Week" is really "Day" for the scoreboard, but FF is really weird.
    # Using the Monday of each matchup week works for this.
    scores = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}")
    day = 0
    for schedule_period in scores["eligibleSchedulePeriods"]:
        if schedule_period["ordinal"] == week:
            day = schedule_period["low"]["ordinal"]
            break

    # Season over, or this week doesn't exist. Exit and zero out this league
    if day == 0:
        print(f"Week {week} does not exist in {league}")
        cursor.execute("UPDATE Teams set currentWeekPF=0.0, CurrOpp=NULL, matchupID=NULL where leagueID=%s and year=%s", (league, year))
        return

    # Call it again for the week based on our current week
    scores = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}&scoring_period={day}")

    for game in scores["games"]:
        matchup_id = game["id"]
        away_id = game["away"]["id"]
        away_score = game["awayScore"]["score"]["formatted"]
        home_id = game["home"]["id"]
        home_score = game["homeScore"]["score"]["formatted"]

        tracked.append(str(away_id))
        tracked.append(str(home_id))

        cursor.execute("UPDATE Teams set currentWeekPF=%s, CurrOpp=%s, matchupID=%s where teamID=%s AND year=%s", (away_score, home_id, matchup_id, away_id, year))
        cursor.execute("UPDATE Teams set currentWeekPF=%s, CurrOpp=%s, matchupID=%s where teamID=%s AND year=%s", (home_score, away_id, matchup_id, home_id, year))

    # Reset teams on bye to 0.0 points with null opponent and matchup id
    if len(tracked) < 14:
        tracked_string = ",".join(tracked)
        cursor.execute("UPDATE Teams set currentWeekPF=0.0, CurrOpp=NULL, matchupID=NULL where leagueID=%s and year=%s and teamID NOT IN (%s)", (league, year, tracked_string))

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
cursor = db.cursor()

for year in years_to_update:
    for league in get_leagues_from_database(year):
        print(f"Updating {league}")
        updateCurrentPF(league["id"], league["year"])

db.commit()
