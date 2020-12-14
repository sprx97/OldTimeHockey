import Config
import MySQLdb
import requests
import sys
import json

YEAR = sys.argv[1]
if len(sys.argv) > 2:
    TIERS = sys.argv[2].split(",")
else:
    TIERS = []
TIERS = [str(n) for n in TIERS] # convert to strings
last_pick = 18*14 # hardcoded yolo

# Grab the list of leagues for this query from our database
db = MySQLdb.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()
cmd = "SELECT L.id FROM Leagues L WHERE L.year=" + YEAR
if len(TIERS) > 0:
    cmd += " AND L.tier IN (" + ",".join(TIERS) + ")"
cursor.execute(cmd)
leagues = cursor.fetchall()

# Get and store the draft results from each league on fleaflicer
players = {}

def pull_league(league_id):
    response = requests.get("http://www.fleaflicker.com/api/FetchLeagueDraftBoard?league_id=" + str(league_id) + "&season=" + YEAR + "&sport=NHL")
    assert response.status_code == 200, "Failed to find league " + str(league_id) + " for season " + YEAR
    response = response.json()

    # League draft isn't completed, skip
    if "player" not in response["rows"][-1]["cells"][1]: # look at 2nd to last pick because of weird FF bug
        return

    # check each round of the draft
    for row in response["rows"]:
        cells = row["cells"]
        round = row["round"]

        # Even numbered rounds are in reverse order because of snake draft
        if round % 2 == 0:
            cells.reverse()

        for pick in range(len(cells)):
            if "player" not in cells[pick]:
#                print("Missing draft pick in league " + str(league_id) + ", pick " + str(round) + "." + str(pick+1))
                break

            player = cells[pick]["player"]["proPlayer"]
            pick = len(cells)*(round-1) + pick + 1
            id = player["id"]
            if id not in players:
                name = player["nameFull"]
                pos = player["position"]
                team = player["proTeamAbbreviation"]
                players[id] = {"name":name, "position":pos, "team":team, "picks":[]}
            players[id]["picks"].append(pick)

for league in leagues:
    pull_league(league[0])

#for id in players:
#    p = players[id]
#    if len(p["picks"]) < len(leagues):
#        p["picks"] += [last_pick+1]*(len(leagues)-len(p["picks"]))

# Helper method to find the ADP of a player, by averaging their pick numbers
def ADP(list):
  return (sum(list) + (last_pick+1)*(len(leagues)-len(list)))/len(leagues)

# Sort players on ADP
players = {k: v for k, v in sorted(players.items(), key=lambda item: ADP(item[1]["picks"]))}

out = "["
for p in players:
    out += json.dumps(players[p]) + ","
out = out[:-1] + "]"
print(out)
