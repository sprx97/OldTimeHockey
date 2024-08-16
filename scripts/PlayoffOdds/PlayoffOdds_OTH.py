import os
import pymysql
import random
import sys
import ujson

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared.Shared import *
from shared import Config

# TODO: Consider adding a constant random.seed so it's reproducible

stddev = 30
def project_winner(teams, away, home):
    away_random_pf = random.gauss(teams[away]["PF_avg"], stddev)
    home_random_pf = random.gauss(teams[home]["PF_avg"], stddev)

    teams[away]["PF"] += away_random_pf
    teams[home]["PF"] += home_random_pf
    if away_random_pf > home_random_pf:
        teams[away]["wins"] += 1
        teams[home]["losses"] += 1
        return away
    else:
        teams[away]["losses"] += 1
        teams[home]["wins"] += 1
        return home

def calculate_playoff_odds(league, year, current_week = None):
    print(f"Calculating playoff odds for league {league} in {year}")

    teams = {}
    matches = []

    # Get current standings
    standings = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league}&season={year}")
    for team in standings["divisions"][0]["teams"]:
        id = str(team["id"])
        teams[id] = {"wins": team["recordOverall"]["wins"] if "wins" in team["recordOverall"] else 0,
                     "losses": team["recordOverall"]["losses"] if "losses" in team["recordOverall"] else 0,
                     "PF": team["pointsFor"]["value"],
                     "playoff_odds": 0,
                     "seeds": [0]*14,
                     "records": {},
                     "current_week": {"win": {"make_playoffs": 0, "total": 0}, "loss": {"make_playoffs": 0, "total": 0}}}
        teams[id]["PF_avg"] = teams[id]["PF"] / (teams[id]["wins"] + teams[id]["losses"])

    # Get remaining weeks
    schedule = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}")
    if current_week == None:
        current_week = schedule["schedulePeriod"]["ordinal"]
    remaining_weeks = []
    for schedule_period in schedule["eligibleSchedulePeriods"]:
        if schedule_period["ordinal"] > current_week:
            remaining_weeks.append(schedule_period["low"]["ordinal"])

    # Trim off playoff weeks. This may be too simple of a solution but it works for now.
    if len(remaining_weeks) < 3:
        return
    remaining_weeks = remaining_weeks[:-3]

    # Get matches in remaining weeks
    for week in remaining_weeks:
        schedule = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}&scoring_period={week}")
        for game in schedule["games"]:
            id1 = str(game["away"]["id"])
            id2 = str(game["home"]["id"])

            matches.append((id1, id2))
    print("All API calls completed. Starting simulations.")

    # Monte Carlo Simulation of remaining schedule
    simulations = 10000 # TODO: Update to 100k
    for _ in range(simulations):
        copy_teams = ujson.loads(ujson.dumps(teams))

        for n in range(len(matches)):
            away, home = matches[n]
            winner = project_winner(copy_teams, away, home)
            if n < 7: # Current week (ie first matchup for each team)
                copy_teams[winner]["win_current_week"] = True

        copy_teams = dict(sorted(copy_teams.items(), key=lambda item: (item[1]["wins"], item[1]["PF"]), reverse=True))
        team_keys = list(copy_teams.keys())
        for rank in range(len(team_keys)):
            team = team_keys[rank]

            # Basic playoff odds counts
            teams[team]["seeds"][rank] += 1
            if rank < 6:
                teams[team]["playoff_odds"] += 1

            # Odds by record counts
            record = f"{copy_teams[team]['wins'] - teams[team]['wins']}-{copy_teams[team]['losses'] - teams[team]['losses']}"
            if record not in teams[team]["records"]:
                teams[team]["records"][record] = {"made_playoffs": 0, "total": 0}
            teams[team]["records"][record]["total"] += 1
            if rank < 6:
                teams[team]["records"][record]["made_playoffs"] += 1

            # Odds by current week results counts
            if "win_current_week" in copy_teams[team]:
                teams[team]["current_week"]["win"]["total"] += 1
                if rank < 6:
                    teams[team]["current_week"]["win"]["make_playoffs"] += 1
            else:
                teams[team]["current_week"]["loss"]["total"] += 1
                if rank < 6:
                    teams[team]["current_week"]["loss"]["make_playoffs"] += 1
    print("Simulations completed.")

    # Tidy up, sort, and format all the data to store
    for team in teams:
        teams[team]["playoff_odds"] = round(teams[team]["playoff_odds"] / (simulations / 100), 2)
        teams[team]["seeds"] = [round(x / simulations * 100, 2) for x in teams[team]["seeds"]]
        teams[team]["records"] = dict(sorted(teams[team]["records"].items(), key=lambda item: int(item[0].split("-")[0]), reverse=True))

        for record in teams[team]["records"]:
            teams[team]["records"][record]["odds"] = round(teams[team]["records"][record]["made_playoffs"] / teams[team]["records"][record]["total"] * 100, 2)

        try:
            teams[team]["current_week"]["win"]["odds"] = round(teams[team]["current_week"]["win"]["make_playoffs"] / teams[team]["current_week"]["win"]["total"] * 100, 2)
            teams[team]["current_week"]["loss"]["odds"] = round(teams[team]["current_week"]["loss"]["make_playoffs"] / teams[team]["current_week"]["loss"]["total"] * 100, 2)
        except:
            teams[team]["current_week"]["win"] = {"make_playoffs": "-", "total": "-", "odds": "-"}
            teams[team]["current_week"]["loss"] = {"make_playoffs": "-", "total": "-", "odds": "-"}

    # Write to JSON
    directory = f"scripts/PlayoffOdds/data/{year}/{league}"
    WriteJsonFile(f"{directory}/{current_week}.json", teams)

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
# week = int(f.readline().strip())

for league in get_leagues_from_database(year, None):
    calculate_playoff_odds(league["id"], league["year"], week)
