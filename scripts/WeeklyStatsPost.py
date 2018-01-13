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
	userID = -1
	division = ""
	wins = -1
	losses = -1
	gb = -1
	streak = ""
	PF = 0.0
	PA = 0.0
	def printTeam(self):
		print self.name, self.user, self.wins, self.losses, self.streak, self.PF, self.PA

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

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()
if os.path.isfile("/var/www/roldtimehockey/scripts/weeks/" + str(year) + "_Week_" + str(week) + ".txt"):
	raise Exception("Stats file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open("/var/www/roldtimehockey/scripts/weeks/" + str(year) + "_Week_" + str(week) + ".txt", "w")
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
standingsBase = "http://www.fleaflicker.com/nhl/leagues/"
def scoreboardURL(league, week):
	return "http://www.fleaflicker.com/nhl/leagues/" + str(division_ids[league]) + "/scores?week=" + str(weekIDs[week]) + "&season=" + str(year)
# also need url for leaders page for coaching %
# also need url for individual matchups for daily scores

goalieStatsBase = "http://www.fleaflicker.com/nhl/leagues/7540/players?sortMode=3&position=16&isFreeAgent=false&tableSortName=pv11&tableSortDirection=DESC"
def goalieStatsURL(week):
	return goalieStatsBase + "&season=" + str(year) + "&week=" + str(weekIDs[week]) + "&statRange=" + str(weekIDs[week])

defensemenStatsBase = "http://www.fleaflicker.com/nhl/leagues/7540/players?&sortMode=3&position=8&isFreeAgent=false&tableSortName=pv11&tableSortDirection=DESC"
def defensemenStatsURL(week):
	return defensemenStatsBase + "&season=" + str(year) + "&week=" + str(weekIDs[week]) + "&statRange=" + str(weekIDs[week])

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
		try:
			next.userID = rows[n][1].cssselect(".user-name")[0].get("href")[7:]
		except:
			next.userID = -1
			next.user = "<Unowned Team>"
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

# extracts games from each division
def parseMatches(division, week):
	root = getHtml(scoreboardURL(division, week))
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

def parseScores(division, week):
	scores = {}

#	printHtml(getHtml(scoreboardURL(division, week)), 0)

	roots = getHtml(scoreboardURL(division, week)).cssselect(".panel-body")[0]
	for n in range(0, len(roots), 2):
		name_tag = roots[n]
		score_tag = roots[n+1]
		name = ""
		score = 0.0
		try:
			name = name_tag[0][-1].attrib['title']
		except:
			name = name_tag[0][-1].text_content()
		score = float(score_tag.text_content())
		scores[(name, division)] = score
	return scores

##################################################################

def generateOverallPointsLeaders(all_teams, number=10):
	s = "###OVERALL POINTS LEADERS - Who has scored the most points this season?\n"
	s += "**LEAGUE**|**TEAM**|**PF**\n"
	s += ":-:|:-:|:--\n"

	all_teams = OrderedDict(sorted(all_teams.iteritems(), key=lambda team: team[1].PF, reverse = True))

#	last_ranks = OrderedDict()
#	for team_name in all_teams.keys():
#		last_ranks[team_name] = 0.0 # reset
#	for div in division_names:
#		for n in range(1, week):
#			week_n_scores = parseScores(div, n)
#			for score in week_n_scores:
#				last_ranks[score.team1] += score.score1
#				last_ranks[score.team2] += score.score2
#			print div, n
#	last_ranks = OrderedDict(sorted(last_ranks.iteritems(), key=lambda team: team[1], reverse = True))
	# gets rankings from previous week

	for n in range(number):
		team = all_teams.values()[n]
		s += team.division + "|" + team.name + "|" + str(team.PF) + "\n"

	s += "-----\n"
	return s

def generateLeagueLeaders(all_teams):
	s = "###LEAGUE LEADERS - Who's in first place?\n"
	s += "**LEAGUE**|**TEAM**|**RECORD**|**GAMES AHEAD**\n"
	s += ":-:|:-:|:-:|:-:\n"

	all_teams = OrderedDict(sorted(all_teams.iteritems(), key=lambda team: team[1].wins, reverse = True))
	divs = []

	leaders = []
	for n in range(len(all_teams)-1):
		team = all_teams.values()[n]
		if team.division in divs:
			continue
		
		l = [team.division, team.name, team.wins, str(team.losses), -1]
	
		for m in range(n+1, len(all_teams)-1):
			if team.division == all_teams.values()[m].division:
				if all_teams.values()[m].gb == 0:
					l[1] += ", " + all_teams.values()[m].name # tie
					l[4] = all_teams.values()[m].gb
				else:
					if l[4] == -1:
						l[4] = all_teams.values()[m].gb
					break
		
		leaders.append(l)
		
		divs.append(team.division)

	leaders.sort(key=lambda team: team[4], reverse = True) # secondary sort by games ahead
	leaders.sort(key=lambda team: team[2], reverse = True) # main sort by wins
	for l in leaders:
		s += l[0] + "|" + l[1] + "|" + str(l[2]) + "-" + l[3] + "|" + str(l[4]) + "\n"

	s += "-----\n"
	return s

def generateLongestStreaks(all_teams, number=5):
	s = "###LONGEST WIN/LOSS STREAKS (regular season) - Who's hot and who's not?\n"
	s += "**LEAGUE**|**OWNER**|**STREAK**|**RECORD**\n"
	s += ":-:|:-:|:-:|:-:\n"
	
	all_teams = OrderedDict(sorted(all_teams.iteritems(), key=lambda team: team[1].streak, reverse = True))

	for team in all_teams.values():
		if all_teams.values().index(team) >= number and (team.streak != all_teams.values()[all_teams.values().index(team)-1].streak):
			break
		s += team.division + "|" + team.user + "|W" + str(team.streak) + "|" + str(team.wins) + "-" + str(team.losses) + "\n"

	s += "-----\n\n"
	s += "**LEAGUE**|**OWNER**|**STREAK**|**RECORD**\n"
	s += ":-:|:-:|:-:|:-:\n"
	
	all_teams = OrderedDict(sorted(all_teams.iteritems(), key=lambda team: team[1].streak))

	for team in all_teams.values():
		if all_teams.values().index(team) >= number and (team.streak != all_teams.values()[all_teams.values().index(team)-1].streak):
			break
		s += team.division + "|" + team.user + "|L" + str(abs(team.streak)) + "|" + str(team.wins) + "-" + str(team.losses) + "\n"

	s += "-----\n"
	return s

def generateWeeklyLeaders(all_scores, number=10):
	s = "###WEEKLY LEAGUE LEADERS - Who scored the most points this week?\n"
	s += "**LEAGUE**|**TEAM**|**WEEKLY POINTS**|**WEEKLY RANK**\n"
	s += ":-:|:-:|:-:|:-:\n"
	
	all_scores = OrderedDict(sorted(all_scores.iteritems(), key=lambda score: score[1], reverse = True))
	
	# write the weekly scores (for woppa cup use)
	f_csv = open("/var/www/roldtimehockey/scripts/WeeklyScores/" + str(year) + "_Week_" + str(week) + ".csv", "w")

	found = []
	for n in range(len(all_scores)):
		f_csv.write(all_scores.keys()[n][0] + "," + str(all_scores.values()[n]) + "\n")
		if n >= number and all_scores.keys()[n][1] in found:
			continue
		s += all_scores.keys()[n][1] + "|" + all_scores.keys()[n][0] + "|" + str(all_scores.values()[n]) + "|" + str(n+1) + "\n"
		found.append(all_scores.keys()[n][1])

	f_csv.close()	
	s += "-----\n"
	return s

def generateWallOfShame(all_scores, week, number=3):
	s = "###WEEKLY WALL-OF-SHAME - Who scored the fewest points this week?\n"
	s += "**LEAGUE**|**TEAM**|**WEEKLY POINTS**\n"
	s += ":-:|:-:|:-:\n"

	# count of number of weeks in WoS

	all_scores = OrderedDict(sorted(all_scores.iteritems(), key=lambda score: score[1]))

	for n in range(number):
#		count = 0
#		for w in range(week-1):
#			week_scores = OrderedDict()
#			for div in division_names:
#				week_scores = parseScores(div, w)
#			week_scores = OrderedDict(sorted(week_scores.iteritems(), key=lambda score: score[1]))
#			for m in range(number):
#				if week_scores.keys()[m][0] == all_scores.keys()[n][0]:
#					count+=1

		s += all_scores.keys()[n][1] + "|" + all_scores.keys()[n][0] + "|" + str(all_scores.values()[n]) + "\n"

	s += "-----\n"
	return s

def generateLeagueAverages(all_scores, week):
	s = "###WEEKLY LEAGUE AVERAGES - What did each league average this week?\n"
	s += "**LEAGUE**|**WEEKLY AVERAGE**\n"
	s += ":-:|:-:\n"

	averages = OrderedDict()
	counts = {}
	for div in division_names:
		averages[div] = 0.0
		counts[div] = 0
	for score in all_scores:
		averages[score[1]] += all_scores[score]
		counts[score[1]] += 1
	for div in averages:
		averages[div] /= counts[div]
	averages = OrderedDict(sorted(averages.iteritems(), key=lambda avg: avg[1], reverse=True))
	for div in averages:
		s += div + "|" + str(round(averages[div], 3)) + "\n"

	s += "-----\n"
	return s

def generateClosestMatchBiggestBlowout(all_matches):
	all_matches = sorted(all_matches, key=lambda match: match.diff)

	s = "###CLOSEST MATCH - Who's really thankful for that extra shot and hit and who suffered a tough loss?\n"
	s += "**" + all_matches[0].team + "**|**" + all_matches[0].opp + "**\n"
	s += ":-:|:-:\n"
	s += str(all_matches[0].score) + "|" + str(all_matches[0].opp_score) + "\n"
	# coaching ratings
	s += "Difference:|" + str(all_matches[0].diff) + "\n"
	s += "League:|" + all_matches[0].division + "\n"
	# link to game
	
	s += "-----\n\n"
	s += "###BIGGEST BLOWOUT - Who forgot to bring their 'A' game?\n"
	s += "**" + all_matches[-1].team + "**|**" + all_matches[-1].opp + "**\n"
	s += ":-:|:-:\n"
	s += str(all_matches[-1].score) + "|" + str(all_matches[-1].opp_score) + "\n"
	# coaching ratings
	s += "Difference:|" + str(all_matches[-1].diff) + "\n"
	s += "League:|" + all_matches[-1].division + "\n"
	# link to game

	s += "-----\n"
	return s

def generateCocommishLeaderboard(all_teams, week, number=3):
	s = "###CO-COMMISH OVERALL LEADERBOARD - Which co-commissioners are doing the best?\n"
	s += "**LEAGUE** | **TEAM** | **CUMULATIVE POINTS** | **OVERALL RANK**\n"
	s += ":-:|:-:|:-:|:-:\n"
	
	all_teams = OrderedDict(sorted(all_teams.iteritems(), key=lambda team: team[1].PF, reverse = True))
	
	count = 0
	for team in all_teams:
		if all_teams[team].user in commishioners:
			s += all_teams[team].division + "|" + all_teams[team].name + "|" + str(all_teams[team].PF) + "|" + str(all_teams.keys().index(team)+1) + "\n"
			count += 1
		if count == number:
			break

	return s

def generateTopPlayers(week):
	s = "###TOP PERFORMING PLAYERS - Self-explanitory\n"
	s += "**PLAYER** | **POINTS** | **NOTABLE STATS**\n"
	s += ":-:|:-:|:-:\n"

	tempplayers = {}	

	# top goalie
	tag = getHtml(goalieStatsURL(week)).cssselect(".table-group")[0].findall("tr")[0]
	name = tag.cssselect(".player")[0][0].text
	team = tag.cssselect(".player-team")[0].text
	total = int(tag.cssselect(".info")[0][0].text)
	wins = int(tag.findall("td")[6].text)
	saves = int(tag.findall("td")[11].text)
	goalsagainst = int(tag.findall("td")[12].text)
	shutouts = int(tag.findall("td")[9].text)

	print "www.fleaflicker.com/" + tag.cssselect(".info")[0][0].get("href")
	# full stats from goalie

	# switch to using stats screen (from href link) to find stats

	goaliestring = name + " (G-" + team + ")|" + str(total) + "|" 
	if wins != 1:
		goaliestring += str(wins) + " wins, "
	else: # grammar
		goaliestring += str(wins) + " win, "
	goaliestring += str(saves) + " saves, " # goalie won't have 1 save
	if goalsagainst != 1:
		goaliestring += str(goalsagainst) + " goals against"
	else:
		goaliestring += str(goalsagainst) + " goal against"
	if shutouts == 1:
		goaliestring += ", " + str(shutouts) + " shutout"
	elif shutouts > 1:
		goaliestring += ", " + str(shutouts) + " shutouts"
	tempplayers[total] = goaliestring
	print goaliestring

	tag = getHtml(defensemenStatsURL(week)).cssselect(".table-group")[0].findall("tr")[0]
	name = tag.cssselect(".player")[0][0].text
	team = tag.cssselect(".player-team")[0].text
	total = int(tag.cssselect(".info")[0][0].text)
	# get stats (also find hits/blocks)
	# should be able to follow link from <a> tag (player name)
	printHtml(tag, 0)
	print "www.fleaflicker.com/" + tag.cssselect(".info")[0][0].get("href")

	# top forward

	# sort and display

	return s

##################################################################

if __name__ == "__main__":
	all_teams = OrderedDict()
	all_matches = []
	all_scores = OrderedDict()
	for div in division_names:
		all_teams.update(parseTeams(div))
		all_matches += parseMatches(div, week)
		all_scores.update(parseScores(div, week))

	for team in all_teams:
#		print year, all_teams[team].userID, all_teams[team].streak
		cursor.execute("SELECT Teams.streak, Teams.replacement from Teams inner join Leagues on Teams.leagueID=Leagues.id where year=" + str(year-1) + " and ownerID=" + str(all_teams[team].userID))
		prev_streak = cursor.fetchall()
		if len(prev_streak) == 0: # no team last year, new owner
			continue
		elif len(prev_streak) > 1: # owner has two teams from last year (replacement)
			for streak in prev_streak:
				if streak[1] == 0: # real team streak
					if all_teams[team].streak * streak[0] > 0 and abs(all_teams[team].streak) == week: # streaks are same direction and year-long
						all_teams[team].streak += streak[0]
					break
		else: # only one team from last year
			if all_teams[team].streak * prev_streak[0][0] > 0 and abs(all_teams[team].streak) == week: # streaks are same direction and year-long
				all_teams[team].streak += prev_streak[0][0]

#	print generateOverallPointsLeaders(all_teams)
	print generateLeagueLeaders(all_teams)
	print generateLongestStreaks(all_teams)
	print generateWeeklyLeaders(all_scores)
	print generateWallOfShame(all_scores, week)
	print generateLeagueAverages(all_scores, week)
	print generateClosestMatchBiggestBlowout(all_matches)
#	print generateCocommishLeaderboard(all_teams, week)
	# Rookie Leaderboard
#	print generateTopPlayers(week)

	# League Season Total?
	# Coaching ratings?
	# Standard Deviation?

#	for team in parseTeams("Gretzky"):
#		team.printTeam()
#	print ""
#	for score in parseMatches("Gretzky", 19):
#		score.printScore()
#	print etree.tostring(division_htmls["Western"], pretty_print=True,	method="html")
