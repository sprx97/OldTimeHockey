import copy
import os
import random
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Shared import *

stddev = 30
def project_winner(teams, away, home):
    away_pf_avg = teams[away]["PF"] / (teams[away]["wins"] + teams[away]["losses"])
    home_pf_avg = teams[home]["PF"] / (teams[home]["wins"] + teams[home]["losses"])

    away_random_pf = random.gauss(away_pf_avg, stddev)
    home_random_pf = random.gauss(home_pf_avg, stddev)

    teams[away]["PF"] += away_random_pf
    teams[home]["PF"] += home_random_pf
    if away_random_pf > home_random_pf:
        teams[away]["wins"] += 1
        teams[home]["losses"] += 1
    else:
        teams[away]["losses"] += 1
        teams[home]["wins"] += 1

    return away if away_random_pf > home_random_pf else home

def calculate_playoff_odds(league, year):
    teams = {}
    matches = []

    # Get current standings
    standings = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league}&season={year}")
    for team in standings["divisions"][0]["teams"]:
        id = str(team["id"])
        teams[id] = {"wins": team["recordOverall"]["wins"], 
                     "losses": team["recordOverall"]["losses"], 
                     "PF": team["pointsFor"]["value"], 
                     "playoff_odds": 0, 
                     "seeds": [0]*14, 
                     "records": {}, 
                     "current_week": {"win": {"make_playoffs": 0, "total": 0}, "loss": {"make_playoffs": 0, "total": 0}}}

    # Get remaining weeks
    schedule = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}")
    current_week = schedule["schedulePeriod"]["ordinal"]
    remaining_weeks = []
    for schedule_period in schedule["eligibleSchedulePeriods"]:
        if schedule_period["ordinal"] > current_week:
            remaining_weeks.append(schedule_period["low"]["ordinal"])

    # Trim off playoff weeks. This may be too simple of a solution but it works for now.
    remaining_weeks = remaining_weeks[:-3]

    # Get matches in remaining weeks
    for week in remaining_weeks:
        schedule = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league}&season={year}&scoring_period={week}")
        for game in schedule["games"]:
            id1 = str(game["away"]["id"])
            id2 = str(game["home"]["id"])

            matches.append((id1, id2))
    print("All API calls complete")

    # Monte Carlo Simulation of remaining schedule
    simulations = 10000
    for _ in range(simulations):
        copy_teams = copy.deepcopy(teams)

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

    # Tidy up, sort, and format all the data to store
    for team in teams:
        teams[team]["playoff_odds"] /= simulations / 100
        teams[team]["seeds"] = [round(x / simulations * 100, 2) for x in teams[team]["seeds"]]
        teams[team]["records"] = dict(sorted(teams[team]["records"].items(), key=lambda item: int(item[0].split("-")[0]), reverse=True))

        for record in teams[team]["records"]:
            teams[team]["records"][record]["odds"] = round(teams[team]["records"][record]["made_playoffs"] / teams[team]["records"][record]["total"] * 100, 2)

        teams[team]["current_week"]["win"]["odds"] = round(teams[team]["current_week"]["win"]["make_playoffs"] / teams[team]["current_week"]["win"]["total"] * 100, 2)
        teams[team]["current_week"]["loss"]["odds"] = round(teams[team]["current_week"]["loss"]["make_playoffs"] / teams[team]["current_week"]["loss"]["total"] * 100, 2)

    # Write to JSON
    directory = f"scripts/PlayoffOdds/data/{year}/{league}"
    WriteJsonFile(f"{directory}/{current_week}.json", teams)

calculate_playoff_odds(12086, 2023)
