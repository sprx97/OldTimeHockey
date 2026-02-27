import json
import os
import pymysql
import requests
import sys

# Import our config file
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ../../
from shared import Config

if len(sys.argv) < 2:
    year = Config.config["year"]
else:
    year = sys.argv[1]

# Grab the list of leagues for this query from our database
db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor(pymysql.cursors.DictCursor)
cursor.execute("SELECT L.id FROM Leagues L WHERE L.year=%s", (year,))
leagues = cursor.fetchall()

for league in leagues:
    league_id = league["id"]
    response = requests.get("http://www.fleaflicker.com/api/FetchLeagueDraftBoard?league_id=" + str(league_id) + "&season=" + year + "&sport=NHL")
    assert response.status_code == 200, "Failed to find league " + str(league_id) + " for season " + year
    response = response.json()

    league_size = 14
    if year == "2012" or (year == "2013" and league_id != 4633):
        league_size = 12

    # League draft isn't completed, skip
    if "player" not in response["rows"][-1]["cells"][1]: # look at 2nd to last pick because of weird FF bug
        continue

    # check each round of the draft
    for row in response["rows"]:
        cells = row["cells"]
        round = row["round"]

        # Even numbered rounds are in reverse order because of snake draft
        if round % 2 == 0:
            cells.reverse()

        cell_num = 0
        for pick in range(len(cells)):
            if "player" not in cells[pick]:
                break

            player = cells[pick]["player"]["proPlayer"]
            pick_num = len(cells)*(round-1) + pick + 1
            team_id = response["draftOrder"][cell_num]["id"]
            player_id = player["id"]
            player_name = player["nameFull"]
            player_team = player["proTeamAbbreviation"]
            player_positions = player["position"] if "position" in player else ""

            cursor.execute("INSERT IGNORE INTO DraftPicks VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", (year, league_id, pick_num, team_id, player_id, player_name, player_team, player_positions))
            cell_num += 1

db.commit()
cursor.close()
