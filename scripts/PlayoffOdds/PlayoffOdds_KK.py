# Python libraries
import os
import sys

# Yahoo sports libraries
from yahoo_oauth import OAuth2
import yahoo_fantasy_api as yfa

# My libraries
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import Config
from Emailer import Emailer

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())

leagues = [ "7679", "10743", "72052", "72056", "72066", "72106", "72543", "72550", "72569", \
            "72580", "72587", "73419", "73420", "73421", "73422", "73423", "73424", "73467", \
            "73468", "73469", "73470", "73472", "73473", "73474", "75406", "75429", "75430", \
            "75431", "75678", "75679", "75681", "75682", "75685", "75695", "75703", "75712", \
            "75918", "75930", "75931", "75932", "75933", "75985"]

oauth_file = Config.config["srcroot"] + "scripts/PlayoffOdds/yahoo_auth.json"
conn = OAuth2(None, None, from_file=oauth_file)
if not conn.token_is_valid():
    conn.refresh_access_token()

game = yfa.Game(conn, "nhl")
game_id = game.game_id()

def sanitize(name):
    name = name.replace("(", "")
    name = name.replace(")", "")
    return name

def updatePlayoffOdds(league_id):
    league_id = game_id + ".l." + league_id
    league = game.to_league(league_id)
    settings = league.settings()

    body = ""

    body += "LeagueBegin\n"

    body += f"\tLeague: {settings['name']} {year} (Sort: League) (Playoffs: 6)\n"

    print(league_id, settings["name"])

    teams = league.teams().values()
    for team in teams:
        body += f"\t\tTeam: {sanitize(team['name'])}\n"

    body += "\tKind: fantasy\n"
    body += "\tSport: hockey\n"
    body += "\tSeason: {year} (current: True)\n"
    body += "\tAuthor: JeremyV\n"
    body += "LeagueEnd\n"

    body += "SortBegin\n"
    body += "League: Wins, GoalsFor\n"
    body += "SortEnd\n"

    body += "RulesBegin\n"
    body += "\tPointsForWinInRegulation: 1\n"
    body += "\tPointsForWinInOvertime: 1\n"
    body += "\tPointsForWinInShootout: 1\n"
    body += "\tPointsForLossInRegulation: 0\n"
    body += "\tPointsForLossInOvertime: 0\n"
    body += "\tPointsForLossInShootout: 0\n"
    body += "\tPointsForTie: 0.5\n"
    body += "\tPercentOfGamesThatEndInTie: 0\n"
    body += "\tPercentOfGamesThatEndInOvertimeWin: 0\n"
    body += "\tPercentOfGamesThatEndInShootoutWin: 0\n"
    body += "\tHomeFieldAdvantage: 0.5\n"
    body += "\tWeightType: PythagenPat\n" # This calculates based on record. Use 50/50 for random odds.
    body += "\tWeightExponent: 0.0\n" # This is ignored by PercentageOfPointsWon
    body += "\tWhatDoYouCallATie: tie\n"
    body += "\tWhatDoYouCallALottery: lottery\n"
    body += "\tWhatDoYouCallPromoted: promoted\n"
    body += "\tPromote: 0\n"
    body += "\tPromotePlus: 0\n"
    body += "\tPromotePlusPercent: 0\n"
    body += "\tWhatDoYouCallDemoted: relegated\n"
    body += "\tDemote: 0\n"
    body += "\tDemotePlus: 0\n"
    body += "\tDemotePlusPercent: 0\n"
    body += "RulesEnd\n"

    body += "GamesBegin\n"
    body += "TeamListedFirst: home\n"

    weeks = ";week="
    for week in range(1, int(settings["playoff_start_week"])):
        weeks += str(week) + ","
    weeks = weeks[:-1]

    all_matchups = game.yhandler.get(f"league/{league_id}/scoreboard{weeks}")
    all_matchups = all_matchups["fantasy_content"]["league"][1]["scoreboard"]["0"]["matchups"]

    for m in range(all_matchups["count"]):
        matchup = all_matchups[str(m)]["matchup"]
        week = matchup["week"]
        is_over = matchup["status"] == "postevent"

        matchup = matchup["0"]["teams"]
        away_name = sanitize(matchup["0"]["team"][0][2]["name"])
        away_score = round(float(matchup["0"]["team"][1]["team_points"]["total"])*100)
        home_name = sanitize(matchup["1"]["team"][0][2]["name"])
        home_score = round(float(matchup["1"]["team"][1]["team_points"]["total"])*100)

        if is_over:
            body += f"1/{week}/21\t{home_name}\t{home_score}-{away_score}\t{away_name}\n"
        else:
            body += f"1/{week}/21\t{home_name}\t\t\t{away_name}\n"

    body += "GamesEnd\n"

    gmail_service = Emailer.get_gmail_service()
    Emailer.send_message(gmail_service, "playoff odds update", body, "import@sportsclubstats.com", None, None)
    print("Email sent.")

for league in leagues:
    try:
        updatePlayoffOdds(league)
    except RuntimeError as e:
        print(f"Hit runtime error on league {league}.")
