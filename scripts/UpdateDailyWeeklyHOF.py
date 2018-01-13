# 10/28/2016
# Checks scores to update daily/weekly scoring records

import urllib2 # url reading
from lxml import etree
from lxml import html # xml parsing
import MySQLdb # sql queries

# Check for argument (for weekly vs backfill)
# Find all weekly scores for week
# Find all daily scores for week
# Differentiate 12 vs 14 team leagues
# Discount long weeks
# Update tables if necessary

years_to_update = [2012, 2013, 2014, 2015, 2016] # can manually seed if necessary
weekIDs = [1, 6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 97, 104, 111, 118, 125, 132, 139, 146, 153, 160, 167, 174]
weekShift = {2012 : 10, 2013 : 7, 2014 : 6, 2015 : 6, 2016 : 6}
def getWeekStart(year, week):
	if week == 1:
		return 1
	if year == 2012 or year == 2013:
		week -= 1
	shift = 6
	if year in weekShift.keys():
		shift = weekShift[year]
	return shift + 7*(week-2)

weeklyHighs = []
weeklyHighsPost2013 = []
dailyHighs = []
dailyHighsPost2013 = []

db = MySQLdb.connect(host="localhost", user="root", passwd="12345", db="OldTimeHockey")
cursor = db.cursor()

MAX_LEN = 5
def insertIntoWeeklyHighs(score1, score2, highs):
	# insert first score if necessary
	inserted = False
	for n in xrange(0, len(highs)):
		if score1 >= highs[n][0]:
			highs.insert(n, [score1, team1, league[0], year, weekIndex])
			inserted = True
			break
	if not inserted and len(highs) < MAX_LEN:
		highs.append([score1, team1, league[0], year, weekIndex])
		inserted = True

	# insert second score if necessary
	inserted2 = False
	for n in xrange(0, len(highs)):
		if score2 >= highs[n][0]:
			highs.insert(n, [score2, team2, league[0], year, weekIndex])
			inserted2 = True
			break
	if not inserted2 and len(highs) < MAX_LEN:
		highs.append([score2, team2, league[0], year, weekIndex])
		inserted2 = True

	# trim the list down
	while (inserted or inserted2) and len(highs) > MAX_LEN:
		if highs[-1][0] == highs[-2][0] == highs[MAX_LEN-1][0]:
			break
		highs.pop()

def insertIntoDailyHighs(team, score, highs, index):
	inserted = False
	for n in xrange(0, len(highs)):
		if score >= highs[n][0]:
			highs.insert(n, [score, team, league[0], year, weekIndex, index, matchid]) # week and index can be used to find the actual date
			inserted = True
			break

	if not inserted and len(highs) < MAX_LEN:
		highs.append([score, team, league[0], year, weekIndex, index, matchid]) # week and index can be used to find the actual date
		inserted = True

	# trim the list down to 5
	while inserted and len(highs) > MAX_LEN:
		if highs[-1][0] == highs[-2][0] == highs[MAX_LEN-1][0]:
			break
		highs.pop()

if __name__ == "__main__":
	for year in years_to_update:
		cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
	        leagues = cursor.fetchall()
	        for league in leagues:
			for week in weekIDs:
				if year == 2012 and week == 1:
					continue # first week of 2012 was weird
				weekIndex = weekIDs.index(week)
				if year != 2012:
					weekIndex += 1

				URL = "http://www.fleaflicker.com/nhl/leagues/" + str(league[0]) + "/scores?season=" + str(year) + "&week=" + str(week)
				print URL
			        response = urllib2.urlopen(URL)
	        		page = response.read()
	        		root = html.document_fromstring(page)
				response.close()

			        if len(root.cssselect(".scoreboard-win")) == 0:
					print "Scores for " + league[2] + " " + str(year) + " week " + str(weekIndex) + " not final"
					continue

				# get each individual box score link
		        	boxes = root.cssselect(".pull-right.btn-group")
				for box in boxes:
					boxlink = box.cssselect("a")[0].get("href")
					boxlink = "http://www.fleaflicker.com/" + boxlink
					matchid = boxlink[boxlink.find("scores/")+7:]

					response2 = urllib2.urlopen(boxlink)
					page2 = response2.read()
					boxroot = html.document_fromstring(page2)

					# gets the two team IDs
					team1 = boxroot.cssselect(".league-name a")[0].get("href")
					if "?season" in team1:
						team1 = team1[(team1.find("/teams/") + 7):team1.find("?season")]
					else:
						team1 = team1[(team1.find("/teams/") + 7):]
					team2 = boxroot.cssselect(".league-name a")[1].get("href")
					if "?season" in team2:
						team2 = team2[(team2.find("/teams/") + 7):team2.find("?season")]
					else:
						team2 = team2[(team2.find("/teams/") + 7):]

					days = boxroot.cssselect(".boxscore td.text-right")

					# gets daily estimates (need to navigate to daily page to get exact decimal scoring)
					count = 0
					for day in days:
						# skip the totals for each team
						if count == (len(days)-1) or count == (len(days)/2 - 1):
							count += 1
							continue

						# skip 2012 Roy Week 2 because WEIRD
						if year == 2012 and league[0] == 3914 and (weekIndex) == 2:
							break

						# figure out which team had this score
						team = team1
						index = count
						if count > len(days) / 2 - 1:
							team = team2
							index -= len(days)/2

						if year > 2013:
							insertIntoDailyHighs(team, int(day.text_content()), dailyHighsPost2013, index)
						else:
							insertIntoDailyHighs(team, int(day.text_content()), dailyHighs, index)

						count += 1

					if (len(days)/2)-1 > 7:
						print "Skipping " + str(year) + " week " + str(weekIndex) + " - long week"
						continue

					score1 = float(days[len(days)/2 - 1].text_content())
					score2 = float(days[-1].text_content())

					if year > 2013:
						insertIntoWeeklyHighs(score1, score2, weeklyHighsPost2013)
					else:
						insertIntoWeeklyHighs(score1, score2, weeklyHighs)


	print weeklyHighs
	print weeklyHighsPost2013
	print dailyHighs

	for high in dailyHighs:
		url = "www.fleaflicker.com/nhl/leagues/" + str(high[2]) + "/scores/" + high[6] + "?season=" + str(high[3]) + "&week=" + str(getWeekStart(high[3], high[4]) + high[5])
		print url

	print dailyHighsPost2013

	for high in dailyHighsPost2013:
		url = "www.fleaflicker.com/nhl/leagues/" + str(high[2]) + "/scores/" + high[6] + "?season=" + str(high[3]) + "&week=" + str(getWeekStart(high[3], high[4]) + high[5])
		print url
