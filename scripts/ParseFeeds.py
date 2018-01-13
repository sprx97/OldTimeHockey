import urllib.request
import base64
from lxml import html
import datetime
import threading
import json

emojis = {}
emojis["ARI"] = "<:ARI:269315353153110016>"
emojis["ANA"] = "<:ANA:271881573375279104>"
emojis["BOS"] = "<:BOS:269315305707143168>"
emojis["BUF"] = "<:BUF:269315526717603840>"
emojis["CGY"] = "<:CGY:269315410375999509>"
emojis["CAR"] = "<:CAR:269315433595666432>"
emojis["CHI"] = "<:CHI:269315278880505857>"
emojis["COL"] = "<:COL:269315269002919946>"
emojis["CBJ"] = "<:CBJ:269315288988647425>"
emojis["DAL"] = "<:DAL:269315550188929024>"
emojis["DET"] = "<:DET:269315577682722826>"
emojis["EDM"] = "<:EDM:269315479464706048>"
emojis["FLA"] = "<:FLO:269315494652280832>"
emojis["FLO"] = "<:FLO:269315494652280832>"
emojis["LAK"] = "<:LAK:269315457188626432>"
emojis["MIN"] = "<:MIN:269315563606507521>"
emojis["MTL"] = "<:MTL:269315427874635776>"
emojis["NSH"] = "<:NSH:269315511702126594>"
emojis["NJD"] = "<:NJD:269315361126481930>"
emojis["NYI"] = "<:NYI:269315441204264960>"
emojis["NYR"] = "<:NYR:269315518907809792>"
emojis["OTT"] = "<:OTT:269315534301036544>"
emojis["PHI"] = "<:PHI:269315418513080331>"
emojis["PIT"] = "<:PIT:269315504324214786>"
emojis["STL"] = "<:STL:269315296328679436>"
emojis["SJS"] = "<:SJS:269315542509289472>"
emojis["TBL"] = "<:TBL:269315471919022090>"
emojis["TOR"] = "<:TOR:269315465069723648>"
emojis["VAN"] = "<:VAN:269315315194658818>"
emojis["VGK"] = "<:VGK:363836502859448320>"
emojis["WSH"] = "<:WSH:269327070977458181>"
emojis["WPG"] = "<:WPJ:269315448833703946>"
emojis["WPJ"] = "<:WPJ:269315448833703946>"

scoreboard = {}
completed = []
reported = []
lastDate = None

# DEBUG: pretty-prints the xml/html tree
def printHtml(root, depth):
        for n in range(0, depth):
                print(" ",)
        print(depth,)
        print(root.tag, root.get("class"), root.text)
        for child in root:
                printHtml(child, depth+1)

# Gets the feed from the given URL from mysportsfeeds.com, using my login info
def getFeed(url):
	request = urllib.request.Request(url)
	
	auth = urllib.request.HTTPPasswordMgrWithDefaultRealm()
	auth.add_password(None, "https://www.mysportsfeeds.com/api", "sprx97", "statfeeds")
	auth_handler = urllib.request.HTTPBasicAuthHandler(auth)
	opener = urllib.request.build_opener(auth_handler)
	urllib.request.install_opener(opener)

	response = urllib.request.urlopen(request)
	page = response.read()
	root = html.document_fromstring(page)
	response.close()
	return root

# Gets the feed using the new NHL.com API
def getFeed2(url):
	request = urllib.request.Request(url)
	response = urllib.request.urlopen(request)
	return json.loads(response.read().decode())

# Parses the play-by-play data for a game
def parseGame(feed):
	try:
		root = getFeed(feed)
	except Exception as e:
		print("Failed to find feed.")
		return []

	goalStrings = [] # return value
	goals = root.cssselect("goal")
	for goal in goals:
		goal = goal.getparent()
		period = goal.cssselect("period")[0].text_content()
		if period == "3":
			period += "rd"
		elif period == "2":
			period += "nd"
		elif period == "1":
			period += "st"
		elif period == "4":
			period = "OT"
		strength = goal.cssselect("specialTeam")[0].text_content()
		if strength.startswith("EV"):
			strength = ""
		elif strength.startswith("PP"):
			strength = "(PP) "
		elif strength.startswith("SH"):
			strength = "(SH) "
		# EN Goals seem a bit buggy, so leaving it alone for now

		time = goal.cssselect("time")[0].text_content()
		team = goal.cssselect("teamabbreviation")[0].text_content()
		scorer = goal.cssselect("goalScorer firstName")[0].text_content()[0] + ". " + goal.cssselect("goalScorer lastName")[0].text_content()

		assist1 = goal.cssselect("assist1player lastName")
		if len(assist1) == 0:
			assist1 = "unassisted"
		else:
			assist1 = goal.cssselect("assist1player firstName")[0].text_content()[0] + ". " + assist1[0].text_content()
		
		assist2 = goal.cssselect("assist2player lastName")
		if len(assist2) == 0:
			assist2 = ""
		else:
			assist2 = ", " + goal.cssselect("assist2player firstName")[0].text_content()[0] + ". " + assist2[0].text_content()
		goalStrings.append("GOAL " + strength + emojis[team] + " " + team + " " + time + " " + period + ": " + scorer + " (" + assist1 + assist2 + ")")
	psgoals = root.cssselect("penaltyShot")
	for goal in psgoals:
		goal = goal.getparent()
		period = goal.cssselect("period")[0].text_content()
		if period == "3":
			period += "rd"
		elif period == "2":
			period += "nd"
		elif period == "1":
			period += "st"
		elif period == "4":
			period = "OT"
		outcome = goal.cssselect("outcome")[0].text_content()
		if outcome.startswith("Scored"):
			time = goal.cssselect("time")[0].text_content()
			team = goal.cssselect("teamabbreviation")[0].text_content()
			scorer = goal.cssselect("shooter firstName")[0].text_content()[0] + ". " + goal.cssselect("shooter lastName")[0].text_content()

			goalStrings.append("GOAL (Penalty Shot) " + emojis[team] + " " + team + " " + time + " " + period + ": " + scorer)

		# Could also post if the PS is missed, but that would be more complicated

	return goalStrings

# parses the NHL scoreboard for a given date
def parseScoreboard(date): # YYYYmmdd format
	global lastDate, scoreboard, reported, completed

	# reseet for new day
	if date != lastDate:
		scoreboard = {}
		reported = []
		completed = []
		lastDate = date
	stringsToAnnounce = []

	try:
		root = getFeed("https://www.mysportsfeeds.com/api/feed/pull/nhl/2017-2018-regular/scoreboard.xml?fordate=" + date)
	except Exception as e:
		print("Failed to find feed.")
		return []

	games = root.cssselect("gameScore")
	for game in games:
		away = game.cssselect("awayteam abbreviation")[0].text_content()
		home = game.cssselect("hometeam abbreviation")[0].text_content()
		key = away + "-" + home

		isUnplayed = game.cssselect("isUnplayed")[0].text_content() == "true"
		isInProgress = game.cssselect("isInProgress")[0].text_content() == "true"

		periods = game.cssselect("period")

		awayScore = 0
		homeScore = 0
		if len(game.cssselect("awayScore")) > 0:
			awayScore = int(game.cssselect("awayScore")[0].text_content())
		if len(game.cssselect("homeScore")) > 0:
			homeScore = int(game.cssselect("homeScore")[0].text_content())

		# add to scoreboard if it isn't there already
		if key not in scoreboard:
			print("Creating new key " + key)
			scoreboard[key] = []

		# game just started
		if not isUnplayed and len(scoreboard[key]) == 0:
			scoreboard[key] = [awayScore, homeScore]
			if scoreboard[key] == [0, 0]:
				stringsToAnnounce.append(emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Starting")
			elif isInProgress:
				s = emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Already Started. Score is " + str(scoreboard[key][0]) + "-" + str(scoreboard[key][1]) + "."
				stringsToAnnounce.append(s)
			else:
				s = emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Already Finished. Final was " + str(scoreboard[key][0]) + "-" + str(scoreboard[key][1])
				if len(periods) == 4:
					s += " (OT)."
				elif len(periods) == 5:
					s += " (SO)."
				else:
					s += "."
				stringsToAnnounce.append(s)
				completed.append(key)

		# check to see if score is different from what we have saved
		goals = parseGame("https://www.mysportsfeeds.com/api/feed/pull/nhl/2017-2018-regular/game_playbyplay.xml?gameid=" + date + "-" + key)
		
		# get more accurate home/away scores from the playbyplay in order to stay in sync with goal reporting
		awayScore = 0
		homeScore = 0
		for goal in goals:
			goalteam = goal.split(" ")[2]
			if goalteam not in emojis.keys():
				goalteam = goal.split(" ")[3]
			if goalteam == away:
				awayScore += 1
			else:
				homeScore += 1

			split = goal.split(":")
			goalkey = split[2] + ":" + split[3]
			if goalkey not in reported:
				stringsToAnnounce.append(goal + " (" + away + " " + str(awayScore) + ", " + home + " " + str(homeScore) + ")")
				reported.append(goalkey)
#			print(goalkey)


			# find how many scores have changed
#			awayDelta = awayScore - scoreboard[key][0]
#			if awayDelta < 0:
#				print("Away goal(s) removed in " + key + ". Is this right?")
#				awayDelta = 0
#			homeDelta = homeScore - scoreboard[key][1]
#			if homeDelta < 0:
#				print("Home goal(s) removed in " + key + ". Is this right?")
#				homeDelta = 0
#			count = awayDelta + homeDelta
#
#			scoreboard[key] = [awayScore, homeScore]
#
#			# don't count shootout "goals"
#			if len(periods) == 5 and not isInProgress:
#				if awayScore > homeScore:
#					awayScore -= 1
#				else:
#					homeScore -= 1
#
#			# Post the last N goals from the game stream
#			if count > 0:
#				goals = parseGame("https://www.mysportsfeeds.com/api/feed/pull/nhl/2017-2018-regular/game_playbyplay.xml?gameid=" + date + "-" + key)
#				# sometimes the scoreboard updates before the play-by-play
#				if len(goals) == homeScore + awayScore:
#					goals = goals[-1*count:]
#					# print each goal, followed by the score
#					for goal in goals:
#						stringsToAnnounce.append(goal + " (" + away + " " + str(awayScore) + ", " + home + " " + str(homeScore) + ")")

		# print final result
		if not isUnplayed and not isInProgress and key not in completed:
			completed.append(key)
			awayScore = int(game.cssselect("awayScore")[0].text_content())
			homeScore = int(game.cssselect("homeScore")[0].text_content())

			goals = parseGame("https://www.mysportsfeeds.com/api/feed/pull/nhl/2017-2018-regular/game_playbyplay.xml?gameid=" + date + "-" + key)
			# sometimes the scoreboard updates before the play-by-play
			# prevents recording OT final before announcing the last goal
			if len(goals) == homeScore + awayScore:
				# construct string to print
				finalstring = emojis[away] + " " + away + " " + str(awayScore) + ", " + emojis[home] + " " + home + " " + str(homeScore) + " Final"
				if len(periods) == 4:
					finalstring += " (OT)"
				elif len(periods) == 5:
					finalstring += " (SO)"
				stringsToAnnounce.append(finalstring)

	return stringsToAnnounce

#	print scoreboard
#	print

# parses the NHL scoreboard for a given date
def parseScoreboard2(date): # YYYYmmdd format
	global lastDate, scoreboard, reported, completed

	# reseet for new day
	if date != lastDate:
		scoreboard = {}
		reported = []
		completed = []
		lastDate = date
	stringsToAnnounce = []

	try:
		root = getFeed2("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
	except Exception as e:
		print("Failed to find feed.")
		return []

	games = root["dates"][0]["games"]
	for game in games:
		playbyplayURL = "https://statsapi.web.nhl.com" + game["link"]
		try:
			playbyplay = getFeed2(playbyplayURL)
		except Exception as e:
			print("Failed to find feed.")
			return []

		away = playbyplay["gameData"]["teams"]["away"]["abbreviation"]
		home = playbyplay["gameData"]["teams"]["home"]["abbreviation"]
		key = away + "-" + home

		isUnplayed = playbyplay["gameData"]["status"]["detailedState"] == "Scheduled"
		isInProgress = playbyplay["gameData"]["status"]["detailedState"] == "In Progress"

		period = "(" + playbyplay["liveData"]["linescore"]["currentPeriodOrdinal"] + ")"
		awayScore = playbyplay["liveData"]["boxscore"]["teams"]["away"]["teamStats"]["teamSkaterStats"]["goals"]
		homeScore = playbyplay["liveData"]["boxscore"]["teams"]["home"]["teamStats"]["teamSkaterStats"]["goals"]

		# add to scoreboard if it isn't there already
		if key not in scoreboard:
			print("Creating new key " + key)
			scoreboard[key] = []

		# game just started
		if not isUnplayed and len(scoreboard[key]) == 0:
			scoreboard[key] = [awayScore, homeScore]
			if scoreboard[key] == [0, 0]:
				stringsToAnnounce.append(emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Starting")
			elif isInProgress:
				s = emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Already Started. Score is " + str(scoreboard[key][0]) + "-" + str(scoreboard[key][1]) + "."
				stringsToAnnounce.append(s)
			else:
				s = emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Already Finished. Final was " + str(scoreboard[key][0]) + "-" + str(scoreboard[key][1])
				if period != "(3rd)":
					s += " " + period
				s += "."
				stringsToAnnounce.append(s)
				completed.append(key)


		# check to see if score is different from what we have saved
		goals = playbyplay["liveData"]["plays"]["scoringPlays"]

		for goal in goals:
			goalkey = str(game["gamePk"]) + ":" + str(goal)
			if goalkey not in reported:
				goal = playbyplay["liveData"]["plays"]["allPlays"][goal]
				strength = "(" + goal["result"]["strength"]["code"] + ") "
				if strength == "(EVEN) ":
					strength = ""
				en = "(EN) " if goal["result"]["emptyNet"] else "" 

				team = emojis[goal["team"]["triCode"]] + " " + goal["team"]["triCode"]
				time = goal["about"]["periodTime"] + " " + goal["about"]["ordinalNum"]

				score = "(" + away + " " + str(awayScore) + ", " + home + " " + str(homeScore) + ")"

				stringsToAnnounce.append("GOAL " + strength + en + team + " " + time + ": " + goal["result"]["description"] + " " + score)
				reported.append(goalkey)

		# print final result
		if not isUnplayed and not isInProgress and key not in completed:
			if playbyplay["liveData"]["plays"]["allPlays"][-1]["result"]["eventTypeId"] == "GAME_END":
				awayScore = playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["goals"]["away"]
				homeScore = playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["goals"]["home"]
				periods = "(" + playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["ordinalNum"] + ")"
				if periods == "(3rd)":
					periods = ""
				finalstring = emojis[away] + " " + away + " " + str(awayScore) + ", " + emojis[home] + " " + home + " " + str(homeScore) + " Final " + periods
				stringsToAnnounce.append(finalstring)
				completed.append(key)

	return stringsToAnnounce

#	print scoreboard
#	print

def loop():
	threading.Timer(5.0, loop).start()
	date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y%m%d")
	announcements = parseScoreboard(date)
	for str in announcements:
		print(str)

if __name__ == "__main__":
	date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
	for s in parseScoreboard2(date):
		print(s)
#	loop()
