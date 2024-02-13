# Local Includes
import Config
from Shared import *

# Python Includes
import pymysql # sql queries

years_to_update = [] # Can manually seed if necessary

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
years_to_update.append(int(f.readline().strip()))
week = int(f.readline().strip()) # Set to None if manually seeding

def updateCurrentPF(league, year):
    global week

    # Track which teams in this division we've updated, because for playoffs, teams on bye don't show up in FetchLeagueScoreboard
    tracked = []

    # "Week" is really "Day" for the scoreboard, but FF is really weird.
    # Using the Monday of each matchup week works for this.
    scores = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}")
    for schedule_period in scores["eligibleSchedulePeriods"]:
        if schedule_period["ordinal"] == week:
            week = schedule_period["low"]["ordinal"]
            break

    for game in scores["games"]:
        matchup_id = game["id"]
        away_id = game["away"]["id"]
        away_score = game["awayScore"]["score"]["formatted"]
        home_id = game["home"]["id"]
        home_score = game["homeScore"]["score"]["formatted"]

        tracked.append(str(away_id))
        tracked.append(str(home_id))

        cursor.execute(f"UPDATE Teams set currentWeekPF={away_score}, CurrOpp={home_id}, matchupID={matchup_id} where teamID={away_id} AND year={year}")
        cursor.execute(f"UPDATE Teams set currentWeekPF={home_score}, CurrOpp={away_id}, matchupID={matchup_id} where teamID={home_id} AND year={year}")

    # Reset teams on bye to 0.0 points with null opponent and matchup id
    if len(tracked) < 14:
        tracked_string = ",".join(tracked)
        cursor.execute(f"UPDATE Teams set currentWeekPF=0.0, CurrOpp=NULL, matchupID=NULL where leagueID={league} and year={year} and teamID NOT IN ({tracked_string})")

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
cursor = db.cursor()

for year in years_to_update:
    for league in get_leagues_from_database(year):
        updateCurrentPF(league["id"], league["year"])

db.commit()
