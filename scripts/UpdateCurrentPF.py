import urllib.request # url reading
from lxml import etree
from lxml import html # xml parsing
import pymysql # sql queries
import Config # my config file

years_to_update = [] # Can manually seed if necessary

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
years_to_update.append(int(f.readline().strip()))

def printHtml(root, depth):
    for n in range(0, depth):
        print(" ", end='')
    print(depth, end='')
    print(root.tag, root.get("class"), root.text)
    for child in root:
        printHtml(child, depth+1)

def updateCurrentPF(league, year):
    matchesURL = "http://www.fleaflicker.com/nhl/leagues/" + str(league) + "/scores"
    response = urllib.request.urlopen(matchesURL)
    page = response.read()
    root = html.document_fromstring(page)

    isProjected = root.cssselect("#table_0 tr.first th.text-right")
    if len(isProjected) > 0:
        isProjected = (isProjected[0].text_content() == "Projected")
    else:
        isProjected = False

    if len(root.cssselect(".scoreboard-win")) > 0:
        isProjected = True
    panelrows = root.cssselect(".panel-default tr")
    for row in panelrows:
        teamID = row.cssselect("a")[0].get("href")
        if "?season" in teamID:
            teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
        else:
            teamID = teamID[(teamID.find("/teams/") + 7):]
        score = row.cssselect("td")[1].text_content()

        cursor.execute("UPDATE Teams set currentWeekPF=" + str(score) + " where teamID=" + str(teamID) + " AND year=" + str(year))

    # This only needs to run once per week, but not worth the time to optimize right now
    matchups = root.cssselect(".scoreboard")
    matchupLinks = root.cssselect("tr.small")
    for n in range(0, len(matchups), 2):
        teamID1 = matchups[n].cssselect("a")[0].get("href").split("/")[-1]
        teamID2 = matchups[n+1].cssselect("a")[0].get("href").split("/")[-1]
        matchupID = matchupLinks[int(n/2)].cssselect("a")[0].get("href").split("/")[-1]
        cursor.execute("UPDATE Teams SET CurrOpp=" + teamID1 + ", matchupID=" + matchupID + " WHERE teamID=" + teamID2 + " AND year=" + str(year))
        cursor.execute("UPDATE Teams SET CurrOpp=" + teamID2 + ", matchupID=" + matchupID + " WHERE teamID=" + teamID1 + " AND year=" + str(year))

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()

for year in years_to_update:
    cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
    leagues = cursor.fetchall()
    for league in leagues:
        updateCurrentPF(league[0], league[1])

db.commit()
