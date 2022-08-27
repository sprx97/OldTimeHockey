# Standard Python libaries
from lxml import html # xml parsing
import pymysql
import requests
import sys

# My libraries
sys.path.insert(0, "..")
import Config
sys.path.insert(0, "../Emailer")
import Emailer

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())

def updatePlayoffOdds(league):
    link = "http://www.fleaflicker.com/nhl/leagues/" + str(league)
    response = requests.get(link)
    root = html.document_fromstring(response.text)

    body = ""

    body += "LeagueBegin\n"
    if league == 9559 or league == 9899 or league == 14206:
        body += "\tLeague: " + root.cssselect("#top-bar .active")[0].text_content().rstrip() + str(year)[2:4] + str(year+1)[2:4] + " (Sort: League) (Playoffs: 6)\n"
    else:
        body += "\tLeague: " + root.cssselect("#top-bar .active")[0].text_content().split(" ")[0].rstrip() + str(year)[2:4] + str(year+1)[2:4] + " (Sort: League) (Playoffs: 6)\n"

    teams = root.cssselect(".league-name a")
    for team in teams:
        body += "\t\tTeam: " + team.text_content().replace("(", "").replace(")", "") + "\n"

    body += "\tKind: fantasy\n"
    body += "\tSport: hockey\n"
    body += "\tSeason: " + str(year) + " (current: True)\n"
    body += "\tAuthor: Sprx97\n"
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
    body += "\tWeightType: Pythagenpat\n" # This calculates based on opponent strength. Use 50/50 for random odds.
    body += "\tWeightExponent: 0.0\n"
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

    # Convert back to 23 for most seasons
    for n in range(0, 25):
        weeklink = link + "/scores?week=" + str(n*7 + 4) # weird offset from FF... might change year-to-year
        weekresponse = requests.get(weeklink)
        weekroot = html.document_fromstring(weekresponse.text)

        # Reached playoff weeks. Stop.
        playoff_indicator = weekroot.cssselect("tr.last span.text-success")
        if len(playoff_indicator) > 0 and playoff_indicator[0].text_content() == "Playoff Game":
            break

        scores = weekroot.cssselect(".scoreboard")
        for m in range(0, len(scores), 2):
            away = scores[m]
            home = scores[m+1]

            awayname = away.cssselect(".league-name")[0].text_content().replace("(", "").replace(")", "")
            homename = home.cssselect(".league-name")[0].text_content().replace("(", "").replace(")", "")

            awayscore = round(float(away.cssselect(".right")[0].text_content())*100)
            homescore = round(float(home.cssselect(".right")[0].text_content())*100)

            # Hackhackhackhackhack for 2021
            # https://www.fleaflicker.com/nhl/leagues/12087/scores/2751953
            if awayscore == 18515 and homescore == 18515:
                print("Found the fake tie")
                awayscore += 1


            is_over = len(weekroot.cssselect("strong")) > 0 # <strong>Final</strong> exists in weeks that are completed

            if is_over:
                body += "1/" + str(n+1) + "/18\t" + homename + "\t" + str(homescore) + "-" + str(awayscore) + "\t" + awayname + "\n"
            else:
                body += "1/" + str(n+1) + "/18\t" + homename + "\t" + "\t" + "\t" + awayname + "\n"

    body += "GamesEnd\n"

#    print(body)

    gmail_service = Emailer.get_gmail_service()
    Emailer.send_message(gmail_service, "playoff odds update", body, "import@sportsclubstats.com", None, None)
    print("Email sent.")

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()

cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
leagues = cursor.fetchall()
leagues = leagues + tuple([(9559, "OTHKeeper", str(year), 0, 0)]) + tuple([(9899, "OTH Noob Keeper", str(year), 0, 0)]) + tuple([(14206, "OTH Choccy Keeper", 0, 0)])
for league in leagues:
    updatePlayoffOdds(league[0])