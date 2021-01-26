import urllib.request # url reading
from lxml import etree
from lxml import html # xml parsing
import smtplib
import ssl
from email.mime.text import MIMEText
import pymysql
import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())

def updatePlayoffOdds(league):
    link = "http://www.fleaflicker.com/nhl/leagues/" + str(league)
    response = urllib.request.urlopen(link)
    page = response.read()
    root = html.document_fromstring(page)

    body = ""

    body += "LeagueBegin\n"
    body += "\tLeague: " + root.cssselect("#top-bar .active")[0].text_content() + str(year+1) + " (Sort: League) (Playoffs: 6)\n"

    teams = root.cssselect(".league-name a")
    for team in teams:
        body += "\t\tTeam: " + team.text_content() + "\n"

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
    body += "\tWeightExponent: 0.27\n"
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

    for n in range(0, 23):
        weeklink = link + "/scores?week=" + str(n*7 + 4) # weird offset from FF... might change year-to-year
        weekresponse = urllib.request.urlopen(weeklink)
        weekpage = weekresponse.read()
        weekroot = html.document_fromstring(weekpage)

        scores = weekroot.cssselect(".scoreboard")
        for m in range(0, len(scores), 2):
            away = scores[m]
            home = scores[m+1]

            awayname = away.cssselect(".league-name")[0].text_content()
            homename = home.cssselect(".league-name")[0].text_content()

            awayscore = int(float(away.cssselect(".right")[0].text_content())*100)
            homescore = int(float(home.cssselect(".right")[0].text_content())*100)

            is_over = len(away.cssselect(".scoreboard-win")) > 0 or len(home.cssselect(".scoreboard-win")) > 0

            if awayscore != 0 and homescore != 0 and is_over:
                body += "1/" + str(n+1) + "/18\t" + homename + "\t" + str(homescore) + "-" + str(awayscore) + "\t" + awayname + "\n"
            else:
                body += "1/" + str(n+1) + "/18\t" + homename + "\t" + "\t" + "\t" + awayname + "\n"

    body += "GamesEnd\n"

    #print(body)

    try:
        msg = MIMEText(body)
        msg["Subject"] = "playoff odds update"
        msg["From"] = "no-reply@roldtimehockey.com"
        recips = ["import@sportsclubstats.com", "jeremy.vercillo@gmail.com"]
        msg["To"] = ",".join(recips)

        s = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        s.login(Config.config["email_username"], Config.config["email_password"])
        s.sendmail(msg["From"], recips, msg.as_string())
        s.quit()

        print("Email sent.")

    except Exception as e:
        print("Error sending email.")
        print(e)

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()

cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
leagues = cursor.fetchall()
leagues = leagues + tuple([(9559, "OTHKeeper", 2019, 0, 0)])
for league in leagues:
    updatePlayoffOdds(league[0])
