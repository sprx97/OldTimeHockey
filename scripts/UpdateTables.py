from lxml import html # xml parsing
import os
import pymysql # sql queries
import re
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ./../
from shared import Shared
from shared import Config

years_to_update = [] # can manually seed if necessary
playoffs_to_update = []

if len(sys.argv) == 1: # no arguments
    f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
    year = int(f.readline().strip())
    week = int(f.readline().strip())

    years_to_update.append(year)
    if Shared.is_playoff_week(week, year):
        playoffs_to_update.append(year)
    f.close()
else:
    for arg in sys.argv[1:]:
        if len(arg) == 4:
            years_to_update.append(int(arg))
        elif len(arg) == 5 and arg[-1] == "p":
            playoffs_to_update.append(int(arg[:-1]))
        else:
            print("Invalid argument")
            quit()

def printHtml(root, depth):
    for n in range(0, depth):
        print(" ", end='')
    print(depth, end='')
    print(root.tag, root.get("class"), root.text)
    for child in root:
        printHtml(child, depth+1)

# More error-safe parseInt and parseFloat methods
def intP(str):
    if str == "":
        return 0
    return int(str)

def floatP(str):
    if str == "":
        return 0.0
    return float(str)

# Checks the standings pages of the given league and updates the datafile
def getStandings(leagueID, year):
    print(leagueID, year)

    standingsURL = "http://www.fleaflicker.com/nhl/leagues/" + str(leagueID) + "?season=" + str(year)
    response = requests.get(standingsURL)
    root = html.document_fromstring(response.text)
    rows = root.cssselect(".table-striped")[0].findall("tr")
    champs = []
    for n in range(0, len(rows)):
        isChamp = len(rows[n].cssselect(".fa-trophy")) > 0

        if isChamp:
            teamID = rows[n].cssselect(".league-name")[0].findall("a")[0].get("href")
            if "?season" in teamID:
                teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
            else:
                teamID = teamID[(teamID.find("/teams/") + 7):]

            champs.append(teamID)

    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #                                                             #
    #  Need some sort of error handling for if the HTML changes.  #
    #                                                             #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

    leadersTabURL = "http://www.fleaflicker.com/nhl/leagues/" + str(leagueID) + "/leaders?season=" + str(year)
    response2 = requests.get(leadersTabURL)
    root2 = html.document_fromstring(response2.text)
    rows2 = root2.cssselect(".table-group")[0].findall("tr")
    coachRating = {}
    optimumPF = {}
    numrows = len(rows2)-1
    if numrows % 2 != 0:
        numrows += 1
    for n in range(0, numrows):
        teamID = rows2[n].cssselect(".league-name")[0].findall("a")[0].get("href")
        if "?season" in teamID:
            teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
        else:
            teamID = teamID[(teamID.find("/teams/") + 7):]

        try:
            val = rows2[n][10].text_content().replace(",","")

            optimumPF[teamID] = floatP(val.split("(")[0])
            coachRating[teamID] = floatP(val.split("(")[1][:-2])
        except:
            print("Trouble Finding Coach Rating")
            coachRating[teamID] = 0.0
            optimumPF[teamID] = 0.0

    all_teams = []

    standings = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={leagueID}&season={year}")
    for team in standings["divisions"][0]["teams"]:
        team_id = str(team["id"])
        team_name = team["name"]
        team_name = team_name.replace("\u0027", "'") # convert unicode ' to ascii '

        user_id = 0
        if "owners" in team:
            user_id = str(team["owners"][0]["id"])
            user_name = team["owners"][0]["displayName"]
            if user_id == "591742":
                user_id = "157129" # override for rellek multiple accounts
            elif user_id == "698576":
                user_id = "1357398" # override for MWHazard multiple accounts
            elif user_id == "841649":
                user_id = "2267467" # override for dkpatrick multiple accounts

        # wins, losses, pointsFor, pointsAgainst, coachRating*, isChamp, ties
        record = team["recordOverall"]
        wins = record["wins"] if "wins" in record else 0
        losses = record["losses"] if "losses" in record else 0
        ties = record["ties"] if "ties" in record else 0

        points_for = team["pointsFor"]["value"] if "value" in team["pointsFor"] else 0
        points_against = team["pointsAgainst"]["value"] if "value" in team["pointsAgainst"] else 0

        # CR is stored above, but I should have enough info to figure it out
        # Should have enough info to get CR from, and isChamp I think I can figure out.
            # https://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id=12086&season=2020
            # https://www.fleaflicker.com/api/FetchLeagueBoxscore?sport=NHL&league_id=12086&fantasy_game_id=2579652&scoring_period=104
            # https://www.fleaflicker.com/api/FetchLeagueBoxscore?sport=NHL&league_id=12086&fantasy_game_id=2579653&scoring_period=108

        all_teams.append({"team_id": team_id, 
                          "team_name": team_name,
                          "user_id": user_id,
                          "user_name": user_name,
                          "wins": wins,
                          "losses": losses,
                          "points_for": points_for,
                          "points_against": points_against,
                          "coach_rating": coachRating[team_id],
                          "is_champ": team_id in champs,
                          "ties": ties})

    return all_teams

def getPlayoffs(league_id, year):
    teams = {}

    base_scoreboard = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}")
    for period in base_scoreboard["eligibleSchedulePeriods"]:
        # This scoreboard call gets the scoreboard from each week by using the starting day of the scoring period
        start = period["low"]["ordinal"]
        scoreboard = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}&scoring_period={start}")

        if "games" not in scoreboard or "isFinalScore" not in scoreboard["games"][0]:
            print(f"Week {start} does not have final results. Skipping.")
            continue

        if not "isPlayoffs" in scoreboard["games"][0] or not scoreboard["games"][0]["isPlayoffs"]:
            continue

        for game in scoreboard["games"]:
            game_type = None
            if game.get("isPlayoffs"):
                if game.get("isThirdPlaceGame"):
                    game_type = "third_place"
                else:
                    game_type = "playoff"
            elif game.get("isConsolation"):
                if game["away"]["recordOverall"]["rank"] == 14:
                    game_type = None # Skip 13th vs 14th consolation game
                elif game.get("away", {}).get("recordPostseason", {}).get("losses", 0) == 2 or game.get("home", {}).get("recordPostseason", {}).get("losses", 0) == 2:
                    game_type = None # Skip the consolation bracket 3rd place game (9th place game) -- the team that loses this will have two playoff losses, so we can check for that
                else:
                    game_type = "consolation"

            if game_type is None:
                continue

            if not Shared.should_use_consolation_bracket(year) and (game_type == "third_place" or game_type == "consolation"):
                continue

            away_id = str(game["away"]["id"])
            home_id = str(game["home"]["id"])

            away_seed = game["away"]["recordPostseason"]["rank"]
            home_seed = game["home"]["recordPostseason"]["rank"]

            if away_id not in teams:
                teams[away_id] = {"wins_playoff": 0, "losses_playoff": 0, "points_for_playoff": 0, "points_against_playoff": 0, 
                                  "wins_third_place": 0, "losses_third_place": 0, "points_for_third_place": 0, "points_against_third_place": 0, 
                                  "wins_consolation": 0, "losses_consolation": 0, "points_for_consolation": 0, "points_against_consolation": 0, "seed": away_seed}
            if home_id not in teams:
                teams[home_id] = {"wins_playoff": 0, "losses_playoff": 0, "points_for_playoff": 0, "points_against_playoff": 0, 
                                  "wins_third_place": 0, "losses_third_place": 0, "points_for_third_place": 0, "points_against_third_place": 0, 
                                  "wins_consolation": 0, "losses_consolation": 0, "points_for_consolation": 0, "points_against_consolation": 0, "seed": home_seed}

            if "homeResult" in game:
                if game["homeResult"] == "WIN":
                    teams[home_id]["wins_" + game_type] += 1
                    teams[away_id]["losses_" + game_type] += 1
                else:
                    teams[away_id]["wins_" + game_type] += 1
                    teams[home_id]["losses_" + game_type] += 1

            teams[away_id]["points_for_" + game_type] += round(game["awayScore"]["score"]["value"], 2)
            teams[away_id]["points_against_" + game_type] += round(game["homeScore"]["score"]["value"], 2)
            teams[home_id]["points_for_" + game_type] += round(game["homeScore"]["score"]["value"], 2)
            teams[home_id]["points_against_" + game_type] += round(game["awayScore"]["score"]["value"], 2)

    return teams

if __name__ == "__main__":
    db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)
    cursor = db.cursor()

    for year in years_to_update:
        cursor.execute("SELECT * from Leagues where year=%s", (year,)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
            teams = getStandings(league["id"], league["year"])
            for next in teams:
                try:
                    if next["user_name"][-2] == "+":
                        next["user_name"] = next["user_name"][:-3] # elimites "+1" for managers with co-managers
                except:
                    print("Failed to trim co-managers")

                # TODO: This may be a dupe of the part in getStandings
                if str(next["user_id"]) == "591742":
                    next["user_id"] = 157129 # override for rellek multi accounts...
                elif str(next["user_id"]) == "698576":
                    next["user_id"] = 1357398 # override for MWHazard's old account
                elif str(next["user_id"]) == "841649":
                    next["user_id"] = 2267467 # override for dkpatrick multiple accounts

                cursor.execute("SELECT * from Teams where teamID = %s AND year = %s", (next["team_id"], year))
                data = cursor.fetchall()
                if len(data) == 0: # insert new team into table (should only happen once)
                    cursor.execute("INSERT into Teams values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", 
                                   (next["team_id"], league["id"], next["user_id"], next["user_id"], next["team_name"], next["wins"], next["losses"], next["ties"], next["points_for"], next["points_against"], next["coach_rating"], next["is_champ"], 0.0, 0.0, -1, -1, year))
                elif len(data) == 1:
                    if intP(data[0]["ownerID"]) != intP(next["user_id"]) and intP(next["user_id"]) != 0:
                        cursor.execute("UPDATE Teams set ownerID=%s where teamID=%s AND year=%s", (next["user_id"], next["team_id"], year))

                    cursor.execute("UPDATE Teams set name=%s, wins=%s, losses=%s, ties=%s, pointsFor=%s, pointsAgainst=%s, coachRating=%s, isChamp=%s where teamID=%s AND year=%s", 
                                   (next["team_name"], next["wins"], next["losses"], next["ties"], next["points_for"], next["points_against"], next["coach_rating"], next["is_champ"], next["team_id"], year))
                else:
                    raise Exception("Error: more than one team matches teamID: " + str(next["team_id"]))

                # only update the user if there is actually another user
                if (next["user_id"] != 0):
                    cursor.execute("SELECT * from Users where FFid = %s", (next["user_id"],))
                    data = cursor.fetchall()
                    if len(data) == 0: # insert new user into table (should only happen once)
                        cursor.execute("INSERT into Users values (%s, %s, NULL)", (next["user_id"], next["user_name"]))
                    elif len(data) == 1:
                        cursor.execute("UPDATE Users set FFname=%s where FFid=%s", (next["user_name"], next["user_id"]))
                    else:
                        raise Exception("Error: more than one user matches userID: " + str(next["user_id"]))
    
    for year in playoffs_to_update:
        cursor.execute("SELECT * from Leagues where year=%s", (year,)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
            teams_post = getPlayoffs(league["id"], league["year"])
            for next_id in teams_post:
                stats = teams_post[next_id]
                stats["teamID"] = next_id
                stats["year"] = year

                cursor.execute("SELECT * from Teams_post where teamID=%s AND year=%s", (next_id, year))
                data = cursor.fetchall()

                if len(data) == 0: # new team
                    columns = list(stats.keys())
                    placeholders = ", ".join(["%s"] * len(columns))
                    column_names = ", ".join(columns)
                    cursor.execute(f"INSERT into Teams_post ({column_names}) values ({placeholders})", tuple(stats.values()))
                elif len(data) == 1:
                    set_clause = ",".join([f"{col}=%s" for col in stats.keys()])
                    values = list(stats.values()) + [next_id, year]
                    cursor.execute(f"UPDATE Teams_post SET {set_clause} WHERE teamID=%s AND year=%s", tuple(values))
                else:
                    raise Exception("Error: more than one team matches teamID: " + str(next_id))

    db.commit()
