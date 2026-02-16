from lxml import html # xml parsing
import os
import pymysql
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ./../
from shared import Shared
from shared import Config

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor(pymysql.cursors.DictCursor)

key = {
    2012: {
        2: 9.5,
        15: 17.5,
        20: 10.6,
        28: 13.1,
        30: 11.5,
        32: 11.7,
        35: 12.8,
        38: 9.1,
        41: 4.5,
        42: 8.7,
        47: 10,
        49: 2.3,
        51: -1.2,
        59: 9.1,
        67: 13.8,
        70: 1.6,
        78: 15,
        79: 8.7,
        81: 15,
        87: 8.8
    },
    2013: {
        5: 2.4,
        12: 0.5,
        32: 2.1,
        33: 13.2,
        38: 1.6,
        44: 14,
        52: 13.7,
        58: 3.3,
        63: 0.7,
        68: 1.1,
        72: -5.4,
        82: -1.1,
        92: 11.9,
        99: 13.3,
        103: 2.1,
        104: 2.3,
        110: 7.5,
        112: 6,
        115: 2.2,
        117: 1.6,
        131: 14.6,
        150: 0,
        169: 10.9,
        175: 5.4,
        183: 8.4,
        187: 4.1,
        192: 0.8,
        194: 7.6
    },
    2014: {
        4: 7.5,
        11: 4.2,
        15: 7.6,
        18: 12.5,
        21: 13.4,
        23: 2.4,
        39: -1.4,
        44: 2.8,
        50: 1.7,
        53: 3,
        65: 8.1,
        74: 6.3,
        77: 8.6,
        81: 5.2,
        88: -2.9,
        95: -2,
        100: -2.3,
        104: 1.4,
        105: 12.3,
        112: -1.4,
        124: 4.5,
        126: 9.7,
        129: 4.7,
        131: 9.3,
        133: 0,
        135: 7,
        159: 7.1,
        163: 0.8,
        165: 3.7,
        179: 5.2,
        184: 3.2
    }
}

for year in key:
    # Get all leagues for the year
    cursor.execute(f"SELECT id, name from Leagues where year={year}")
    leagues = cursor.fetchall()

    for league in leagues:
        print()
        league_id = league["id"]

        for day in key[year]:
            # This scoreboard call gets the scoreboard from each week by using the starting day of the scoring period
            scoreboard = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}&scoring_period={day}")
            if "games" not in scoreboard or "isFinalScore" not in scoreboard["games"][0]:
                #print(f"Week {week_id} does not have final results. Skipping.")
                continue

            for game in scoreboard["games"]:
                # Skip consolation bracket games
                if "isThirdPlaceGame" in game and game["isThirdPlaceGame"]:
                    #print("Skipping 3rd place game.")
                    continue
                if "isConsolation" in game and game["isConsolation"]:
                    #print("Skipping consolation bracket matchup.")
                    continue

                game_id = game["id"]
                away_id = game["away"]["id"]
                home_id = game["home"]["id"]

                # Finally, this call gets the actual boxscore of the game.
                # Unfortunately this has to be done day by day and will be really slow.
                boxscore = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueBoxscore?sport=NHL&league_id={league_id}&fantasy_game_id={game_id}&scoring_period={day}")

                for slot in boxscore["lineups"][0]["slots"]:
                    if "home" in slot and slot["home"]["proPlayer"]["id"] == 338:
                        print(f"{league_id} {year} {day} {home_id} -- {key[year][day]}")
                    elif "away" in slot and slot["away"]["proPlayer"]["id"] == 338:
                        print(f"{league_id} {year} {day} {away_id} -- {key[year][day]}")
