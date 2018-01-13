import urllib2
from collections import OrderedDict
from lxml import etree
from lxml import html
import MySQLdb
import sys
import os.path

class Team(object):
	# TEAMID
	name = ""
	user = ""
	division = ""
	wins = -1
	losses = -1
	gb = -1
	streak = ""
	PF = 0.0
	PA = 0.0
	prevPFRank = []
	def printTeam(self):
		print self.name, self.user, self.wins, self.losses, self.streak, self.PF, self.PA

##################################################################

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()
if os.path.isfile("/var/www/roldtimehockey/scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt"):
	raise Exception("PFs file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open("/var/www/roldtimehockey/scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt", "w")
weekIDs = [0, 1, 6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 97, 104, 111, 118, 125, 132, 139, 146, 153, 160, 167, 174]

# list of divisions and weeks for creating URLs
db = MySQLdb.connect(host="localhost", user="root", passwd="12345", db="OldTimeHockey")
cursor = db.cursor()
cursor.execute("SELECT Leagues.name, Leagues.id, Users.FFname from Leagues inner join Users on commish=FFid where year=" + str(year)) # all leagues in year
leagues = cursor.fetchall()
division_names = []
commishioners = []
division_ids = {}
for league in leagues:
	division_names.append(league[0])
	division_ids[league[0]] = league[1]
	commishioners.append(league[2])

# URLs for standings/scoreboard/team pages
standingsBase = "http://www.fleaflicker.com/nhl/leagues/" # followed by leagueID
def scoreboardURL(league, week):
	return "http://www.fleaflicker.com/nhl/leagues/" + str(division_ids[league]) + "/scores?week=" + str(weekIDs[week]) + "&season=" + str(year)

# Grabs the HTML off of all the standings pages
division_htmls = {}
for name in division_names:
	standingsURL = standingsBase + str(division_ids[name]) + "?season=" + str(year)
	response = urllib2.urlopen(standingsURL)
	page = response.read()
	# reads html from main league page

	division_htmls[name] = html.document_fromstring(page)
	# lxml parsing

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

# extracts teams from a league
def parseTeams(division):
	root = division_htmls[division]
	rows = root.cssselect(".table-group")[0].findall("tr")
	teams = {}
	for n in range(0, len(rows)):
		next = Team()
		next.division = division

		next.name = rows[n][0].text_content().replace("-*", "")
		next.user = rows[n][1].text_content()
		# 2 is just a horizontal spacer
		next.wins = int(rows[n][3].text_content())
		next.losses = int(rows[n][4].text_content())
		# 5 is win %, which we can just calculate
		try:
			next.gb = int(rows[n][6].text_content())
		except:
			next.gb = 0
		# 7 is postseason record, which I might need later
		
		try:
			next.streak = rows[n][8].text_content()
			if next.streak[0] == 'L':
				next.streak = -1*int(next.streak[1:])
			else:
				next.streak = int(next.streak[1:])
			# 9 is another spacer
			next.PF = float(rows[n][10].text_content().replace(",", ""))
			# 11 is average PF
			next.PA = float(rows[n][12].text_content().replace(",", ""))
			# 13 is average PA
		except:
			next.streak = rows[n][7].text_content()
			if next.streak[0] == 'L':
				next.streak = -1*int(next.streak[1:])
			else:
				next.streak = int(next.streak[1:])
			# 8 is another spacer
			next.PF = float(rows[n][9].text_content().replace(",", ""))
			next.PA = float(rows[n][10].text_content().replace(",", ""))

		teams[(next.name, next.division)] = next
	return teams

def generateOverallPointsLeaders(all_teams):
	numprev = 0
	if numprev >= week:
		numprev = week-1

	s = "###OVERALL POINTS LEADERS - Who has scored the most points this season?\n"
	s += "**Rank**|**League**|**TEAM**|**PF**"
	for n in range(1, numprev):
		s += "|**W-" + str(n) + "**"
	s += "\n"
	s += ":-:|:-:|:-:|:--"
	for n in range(1, numprev):
		s += "|:--"
	s += "\n"	

	for n in range(1, numprev):
		if not os.path.isfile("/var/www/roldtimehockey/scripts/PFs/" + str(year) + "_Week_" + str(week-n) + ".txt"):
			raise Exception("PFs file for " + str(year) + " week " + str(week) + " does not exist.")
		last = open("/var/www/roldtimehockey/scripts/PFs/" + str(year) + "_Week_" + str(week-n) + ".txt", "r")
		content = last.readlines()
		for m in range(3, len(content)-2):
			next = content[m].split('|')
#			try:
#				all_teams[(next[2], next[1])].prevPFRank.append(next[0])
#			except:
#				continue

	all_teams = OrderedDict(sorted(all_teams.iteritems(), key=lambda team: team[1].PF, reverse = True))

	for n in range(len(all_teams)):
		team = all_teams.values()[n]
		s += str(n+1) + "|" + team.division + "|" + team.name + "|" + str(team.PF)
		for m in range(numprev, 1, -1):
			try:
				s += "|" + team.prevPFRank[m]
			except:
				s += "|NR"
		s += "\n"

	s += "-----\n"
	s += "\n*A previous rank of NR means the team has most likely changed their name since then - working on a workaround for this.*\n"
	return s

if __name__ == "__main__":
	all_teams = OrderedDict()
	for div in division_names:
		all_teams.update(parseTeams(div))

	print generateOverallPointsLeaders(all_teams)
