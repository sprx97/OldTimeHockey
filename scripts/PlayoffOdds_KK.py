import smtplib
from email.mime.text import MIMEText
from yahoo_oauth import OAuth2
import yahoo_fantasy_api as yfa
import Config
import time

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())

BBUPFL_LEAGUE_ID = "411.l.73833"
leagues = [ "411.l.19172", "411.l.19179", "411.l.19183", "411.l.24112", "411.l.24120", "411.l.24125", "411.l.24135", "411.l.24137", "411.l.24142", \
            "411.l.24147", "411.l.24158", "411.l.24159", "411.l.24160", "411.l.24162", "411.l.24167", "411.l.24187", "411.l.24190", "411.l.24193", \
            "411.l.24194", "411.l.26239", "411.l.24195", "411.l.25450", "411.l.24211", "411.l.24207", "411.l.24210", "411.l.24201", "411.l.24204", \
            "411.l.24205", "411.l.24202", "411.l.24209", "411.l.24748", "411.l.73532", BBUPFL_LEAGUE_ID]

conn = OAuth2(None, None, from_file="yahoo_auth.json")
if not conn.token_is_valid():
    conn.refresh_access_token()

game = yfa.Game(conn, "nhl")

def sanitize(name):
    name = name.replace("(", "")
    name = name.replace(")", "")
    return name

def updatePlayoffOdds(league_id):
    league = game.to_league(league_id)
    settings = league.settings()

    body = ""

    body += "LeagueBegin\n"

    playoff_teams = 8 if league_id == BBUPFL_LEAGUE_ID else 6
    body += f"\tLeague: {settings['name']} {year} (Sort: League) (Playoffs: {playoff_teams})\n"

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

#    print(body)

    try:
        msg = MIMEText(body)
        msg["Subject"] = "playoff odds update"
        msg["From"] = "no-reply@roldtimehockey.com"
        recips = ["import@sportsclubstats.com"]
        msg["To"] = ",".join(recips)

        s = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        s.login(Config.config["email_username"], Config.config["email_password"])
        s.sendmail(msg["From"], recips, msg.as_string())
        s.quit()

        print("Email sent.")

    except Exception as e:
        print("Error sending email.")
        print(e)

for league in leagues:
    try:
        updatePlayoffOdds(league)
    except RuntimeError as e:
        print(f"Hit runtime error on league {league}.")
