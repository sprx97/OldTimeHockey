import urllib2 # url reading
from lxml import etree
from lxml import html # xml parsing
import MySQLdb # sql queries
import Config # my config file

years_to_update = [] # Can manually seed if necessary

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
years_to_update.append(int(f.readline().strip()))

def printHtml(root, depth):
        for n in range(0, depth):
                print " ",
        print depth,
        print root.tag, root.get("class"), root.text
        for child in root:
                printHtml(child, depth+1)

def updateCurrentPF(league, year):
	matchesURL = "http://www.fleaflicker.com/nhl/leagues/" + str(league) + "/scores"
        response = urllib2.urlopen(matchesURL)
        page = response.read()
        root = html.document_fromstring(page)

	isProjected = root.cssselect("#table_0 tr.first th.text-right")
	if len(isProjected) > 0:
		isProjected = (isProjected[0].text_content() == "Projected")
	else:
		isProjected = False

	panel = root.cssselect(".panel-body")[0]
	if len(root.cssselect(".scoreboard-win")) > 0:
		isProjected = True
	for n in xrange(0, len(panel), 2):
		teamID = panel[n][0].findall("a")[0].get("href")
	        if "?season" in teamID:
 	               teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
     		else:
	               teamID = teamID[(teamID.find("/teams/") + 7):]
		score = panel[n+1].text_content()

		# projections don't count!
		if isProjected:
			score = 0.0
		else:
			cursor.execute("UPDATE Teams set currentWeekPF=" + str(score) + " where teamID=" + str(teamID))

	# This only needs to run once per week, but not worth the time to optimize right now
	matchups = root.cssselect(".scoreboard")
	matchupLinks = root.cssselect("tr.small")
	for n in xrange(0, len(matchups), 2):
		teamID1 = matchups[n].cssselect("a")[0].get("href").split("/")[-1]
		teamID2 = matchups[n+1].cssselect("a")[0].get("href").split("/")[-1]
		matchupID = matchupLinks[n/2].cssselect("a")[0].get("href").split("/")[-1]
		cursor.execute("UPDATE Teams SET CurrOpp=" + teamID1 + ", matchupID=" + matchupID + " WHERE teamID=" + teamID2)
		cursor.execute("UPDATE Teams SET CurrOpp=" + teamID2 + ", matchupID=" + matchupID + " WHERE teamID=" + teamID1)

db = MySQLdb.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()

for year in years_to_update:
        cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
                updateCurrentPF(league[0], league[1])

db.commit()
