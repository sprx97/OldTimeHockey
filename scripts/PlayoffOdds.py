import urllib2 # url reading
from lxml import etree
from lxml import html # xml parsing

link = "http://www.fleaflicker.com/nhl/leagues/12086"
response = urllib2.urlopen(link)
page = response.read()
root = html.document_fromstring(page)

print "LeagueBegin"
print "\tLeague: " + root.cssselect("#top-bar .active")[0].text_content() + " (Sort: League) (Playoffs: 6)"

teams = root.cssselect(".league-name a")
for team in teams:
	print "\t\tTeam: " + team.text_content()

print "\tKind: fantasy"
print "\tSport: hockey"
print "\tSeason 2019 (current: True)"
print "\tAuthor: Sprx97"
print "LeagueEnd"

print "SortBegin"
print "League: Wins, Wins HeadToHead, GoalsFor"
print "SortEnd"

print "RulesBegin"
print "\tPointsForWinInRegulation: 1"
print "\tPointsForWinInOvertime: 1"
print "\tPointsForWinInShootout: 1"
print "\tPointsForLossInRegulation: 0"
print "\tPointsForLossInOvertime: 0"
print "\tPointsForLossInShootout: 0"
print "\tPointsForTie: 0.5"
print "\tPercentOfGamesThatEndInTie: 0"
print "\tPercentOfGamesThatEndInOvertimeWin: 0"
print "\tPercentOfGamesThatEndInShootoutWin: 0"
print "\tHomeFieldAdvantage: 0.5"
print "\tWeightType: Pythagenpat"
print "\tWeightExponent: 0.27"
print "\tWhatDoYouCallATie: tie"
print "\tWhatDoYouCallALottery: lottery"
print "\tWhatDoYouCallPromoted: promoted"
print "\tPromote: 0"
print "\tPromotePlus: 0"
print "\tPromotePlusPercent: 0"
print "\tWhatDoYouCallDemoted: relegated"
print "\tDemote: 0"
print "\tDemotePlus: 0"
print "\tDemotePlusPercent: 0"
print "RulesEnd"

print "GamesBegin"
print "TeamListedFirst: home"

for n in xrange(0, 23):
	weeklink = link + "/scores?week=" + str(n*7 + 4) # weird offset from FF... might change year-to-year
	weekresponse = urllib2.urlopen(weeklink)
	weekpage = weekresponse.read()
	weekroot = html.document_fromstring(weekpage)	

	weekfinished = len(weekroot.cssselect(".scoreboard-win")) == 7 # need 7 wins for the week to be over

	scores = weekroot.cssselect(".scoreboard")
	for m in xrange(0, len(scores), 2):
		away = scores[m]
		home = scores[m+1]

		awayname = away.cssselect(".league-name")[0].text_content()
		homename = home.cssselect(".league-name")[0].text_content()

		if weekfinished:
			awayscore = away.cssselect(".right")[0].text_content()
			homescore = home.cssselect(".right")[0].text_content()

			print "1/" + str(n+1) + "/18\t" + homename + "\t" + homescore + "-" + awayscore + "\t" + awayname
		else:
			print "1/" + str(n+1) + "/18\t" + homename + "\t" + "\t" + "\t" + awayname


print "GamesEnd"
