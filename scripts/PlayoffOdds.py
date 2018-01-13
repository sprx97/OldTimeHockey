import urllib2
from lxml import html
import MySQLdb
import sys
import datetime

class Match:
        team = ""
        opp = ""
        score = 0.0
        opp_score = 0.0
        diff = 0.0
        division = ""
        def printScore(self):
                print self.team, self.score, "\n", self.opp, self.opp_score, "\n"

##################################################################

# method for printing a tabbed html tree
def printHtml(root, depth):
        for n in range(0, depth):
                print " ",
        print depth,
        print root.tag, root.get("class"), root.text
        for child in root:
                printHtml(child, depth+1)

def getHtml(url):
        response = urllib2.urlopen(url)
        page = response.read()
        # reads html from weekly scoreboard page

        return html.document_fromstring(page)

##################################################################

weekIDs = [1, 6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 97, 104, 111, 118, 125, 132, 139, 146, 153, 160, 167, 174]

def getStandings(leagueID, year):
	standingsURL = "http://www.fleaflicker.com/nhl/leagues/" + str(leagueID) + "?season=" + str(year)
	response = urllib2.urlopen(standingsURL)
	page = response.read()
	root = html.document_fromstring(page)

	all_teams = []

        rows = root.cssselect(".table-group")[0].findall("tr")
        for n in range(0, len(rows)):
                user = rows[n][1].text_content()
                teamname = rows[n].cssselect(".league-name")[0].text_content()

		all_teams.append([teamname, user])
	return all_teams

# URLs for standings/scoreboard/team pages
standingsBase = "http://www.fleaflicker.com/nhl/leagues/"
def scoreboardURL(league, year, week):
        return "http://www.fleaflicker.com/nhl/leagues/" + str(league) + "/scores?week=" + str(week) + "&season=" + str(year)

# extracts games from each division
def parseMatches(division, year, week):
        root = getHtml(scoreboardURL(division, year, week))
        rows = root.cssselect(".scoreboard")
        matches = []
        for n in range(0, len(rows), 2):
                next1 = Match()
                next1.division = division
                next1.team = rows[n][0][0].text_content()
                if len(next1.team) < 4 and next1.team[0] == "#":
                        next1.team = rows[n][0][1].text_content()
                next1.score = float(rows[n].cssselect(".right")[0].text_content())
                next1.opp = rows[n+1][0][0].text_content()
                if len(next1.opp) < 4 and next1.opp[0] == "#":
                        next1.opp = rows[n+1][0][1].text_content()
                next1.opp_score = float(rows[n+1].cssselect(".right")[0].text_content())
                next1.diff = abs(next1.opp_score - next1.score)
                matches.append(next1)

        return matches

def getSchedule(leagueID, year):
	games = []
	for week in weekIDs:
		games.extend(parseMatches(leagueID, year, week))
	return games

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
curr_week = int(f.readline().strip())
f.close()

db = MySQLdb.connect(host="localhost", user="root", passwd="12345", db="OldTimeHockey")
cursor = db.cursor()

cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
leagues = cursor.fetchall()
for league in leagues:
	sys.stdout = open("/var/www/roldtimehockey/scripts/PlayoffOdds/" + league[2] + "_" + str(year) + ".txt", "w")

	print "LeagueBegin"
	print "League:", league[2], "(Sort: Lottery) (Playoffs: 6)"
	teams = getStandings(league[0], year)
	for team in teams:
		print "Team:", team[0]
	print "Kind: fantasy"
	print "Sport: hockey"
	print "Level: Division", ("1" if (league[2] == "Gretzky") else ("2" if (league[2] == "Hasek" or league[2] == "Brodeur" or league[2] == "Roy") else "3"))
	print "Season: " + str(year) + " (current: True)"
	print "Author: Jeremy"
	print "Note: www.roldtimehockey.com<br>www.reddit.com/r/oldtimehockey<br>www.fleaflicker.com/nhl/league?leagueId=" + str(league[0]) + "&season=" + str(league[1])
	print "LeagueEnd"

	print "SortBegin"
	print "Lottery: Points, Average Points HeadToHead, GoalsFor"
	print "SortEnd"

	print "RulesBegin"
	print "PointsForWinInRegulation: 1"
	print "PointsForWinInOvertime: 1"
	print "PointsForWinInShootout: 1"
	print "PointsForLossInRegulation: 0"
	print "PointsForLossInOvertime: 0"
	print "PointsForLossInShootout: 0"
	print "PointsForTie: 0.5"
	print "PercentOfGamesThatEndInTie: 0"
	print "PercentOfGamesThatEndInOvertimeWin: 0"
	print "PercentOfGamesThatEndInShootoutWin: 0"
	print "WeightType: Pythagenpat"
	print "WeightExponent: 0.27"
	print "RulesEnd"

	print "GamesBegin"
	print "TeamListedFirst: home"
	startdate = datetime.date(2015, 10, 5)
	print "Date: " + str(startdate.month) + "/" + str(startdate.day) + "/" + str(startdate.year)
	games = getSchedule(league[0], league[1])
	for gameNum in range(0, len(games)):
		if gameNum % 7 == 0 and gameNum != 0:
			startdate += datetime.timedelta(days = 7)
			print "Date: " + str(startdate.month) + "/" + str(startdate.day) + "/" + str(startdate.year)
		game = games[gameNum]
		if gameNum >= 7*(curr_week-1):
			print game.team + "\t\t" + game.opp
		else:
			print game.team + "\t" + str(game.score) + "-" + str(game.opp_score) + "\t" + game.opp
	print "GamesEnd"
	print
