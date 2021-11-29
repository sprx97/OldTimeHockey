import challonge
import Config
config = Config.config
import pymysql
import sys

commit = False
if len(sys.argv) > 1 and sys.argv[1].lower() == "true":
    commit = True

# Grabs the current score and opponent's current score for the given username
# This is a direct copy from the one in DiscordBot/Shared.py
DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
def get_user_matchup_from_database(user, division=None):
    user = user.lower()

    cursor = DB.cursor()

    query = "SELECT me_u.FFname as name, me.currentWeekPF as PF, opp_u.FFname as opp_name, opp.currentWeekPF as opp_PF, me.leagueID as league_id, me.matchupID as matchup_id, " + \
                          "me.wins as wins, me.losses as losses, opp.wins as opp_wins, opp.losses as opp_losses, me.year as year " + \
                          "FROM Teams AS me " + \
                          "LEFT JOIN Teams AS opp ON (me.CurrOpp=opp.teamID AND me.year=opp.year) " + \
                          "INNER JOIN Users AS me_u ON me.ownerID=me_u.FFid " + \
                          "LEFT JOIN Users AS opp_u ON opp.ownerID=opp_u.FFid " + \
                          "INNER JOIN Leagues AS l ON (me.leagueID=l.id AND me.year=l.year) "

    if division == None:
        query += "WHERE me.replacement != 1 "
    else:
        query += "WHERE LOWER(l.name)='" + division.lower() + "' "

    query += "AND LOWER(me_u.FFname)='" + user + "' AND l.year=" + Config.config["year"]

    cursor.execute(query)

    matchup = cursor.fetchall()
    cursor.close()

    return matchup

challonge.set_credentials(Config.config["challonge_username"], Config.config["challonge_api_key"])
wc_id = 10521685 # TODO: hard-coded to test league for now. Need a way to update annually easily. Can be found in the URL of the "report" button on the tourney page

particpants = challonge.participants.index(wc_id)
played = []

for m in challonge.matches.index(wc_id):
    # Skip completed matches, because we only want the current one
    if m["state"] != "open":
        continue

    p1id = m["player1_id"]
    p2id = m["player2_id"]
    p1 = p2 = None

    # Match the IDs from the players in the matchup with participants from the participants list
    for p in particpants:
        if p["id"] == p1id or p1id in p["group_player_ids"]:
            p1 = p
        elif p["id"] == p2id or p2id in p["group_player_ids"]:
            p2 = p
        if p1 != None and p2 != None:
            break

    # Get the name and division (unique keys) for the two players
    p1_name = p1["name"].split(".")[-1]
    p1_div = p1["name"].split(".")[0]
    if p1_div == "Luuuuu":
        p1_div = "Luuuuuuu"

    p2_name = p2["name"].split(".")[-1]
    p2_div = p2["name"].split(".")[0]
    if p2_div == "Luuuuu":
        p2_div = "Luuuuuuu"

    # If we encounter a player for the second time, it means we've moved onto the next round so we're done
    if [p1_name, p1_div] in played or [p2_name, p2_div] in played:
        continue

    # Get the matchup and verify uniqueness for each player, so we can find the PF
    p1_matchup = get_user_matchup_from_database(p1_name, p1_div)
    assert len(p1_matchup) == 1, f"Zero or multiple matchups found for {p1_name}, {p1_div}"
    p1_pf = int(p1_matchup[0]["PF"]*100) # Multiply by 100 because Challonge doesn't support decimals

    p2_matchup = get_user_matchup_from_database(p2_name, p2_div)
    assert len(p2_matchup) == 1, f"Zero or multiple matchups found for {p2_name}, {p2_div}"
    p2_pf = int(p2_matchup[0]["PF"]*100) # Multiply by 100 because Challonge doesn't support decimals

    # Mark these two users as having played
    played.append([p1_name, p1_div])
    played.append([p2_name, p2_div])

    print(f"{p1_name} {p1_pf} - {p2_pf} {p2_name}")

    # actually write to the challonge bracket if desired.
    if commit:
        winner_id = m["player1_id"]
        if p2_pf > p1_pf:
            winner_id = m["player2_id"]

        challonge.matches.update(wc_id, m["id"], scores_csv=f"{p1_pf}-{p2_pf}", winner_id=winner_id)

        # TODO: If it's a semifinal or final match (should be able to tell by number of remaining open matches),
        #       then only write one week worth of scores, instead of finalizing. This may be tricky.