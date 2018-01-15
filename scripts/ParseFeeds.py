import urllib.request
import base64
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

cycles = 0
started = []
completed = []
reported = {}
lastDate = None
waiting = {}

# Gets the feed using the new NHL.com API
def getFeed(url):
	request = urllib.request.Request(url)
	response = urllib.request.urlopen(request)
	return json.loads(response.read().decode())

# parses the NHL scoreboard for a given date
def parseScoreboard(date): # YYYY-mm-dd format
	global lastDate, started, reported, completed

	# reseet for new day
	if date != lastDate:
		reported = {}
		started = []
		completed = []
		lastDate = date
		cycles = 0
		waiting = {}
	stringsToAnnounce = []

	try:
		root = getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
	except Exception as e:
		print("Failed to find feed.")
		return []

	games = root["dates"][0]["games"]
	for game in games:
		playbyplayURL = "https://statsapi.web.nhl.com" + game["link"]
		try:
			playbyplay = getFeed(playbyplayURL)
		except Exception as e:
			print("Failed to find feed.")
			return []

		away = playbyplay["gameData"]["teams"]["away"]["abbreviation"]
		home = playbyplay["gameData"]["teams"]["home"]["abbreviation"]
		key = away + "-" + home

		isFinal = playbyplay["gameData"]["status"]["detailedState"] == "Final"
		isInProgress = playbyplay["gameData"]["status"]["detailedState"] == "In Progress"

		awayScore = playbyplay["liveData"]["boxscore"]["teams"]["away"]["teamStats"]["teamSkaterStats"]["goals"]
		homeScore = playbyplay["liveData"]["boxscore"]["teams"]["home"]["teamStats"]["teamSkaterStats"]["goals"]

		if isInProgress and key not in started:
			stringsToAnnounce.append(emojis[away] + " " + away + " at " + emojis[home] + " " + home + " Starting.")
			started.append(key)

		# check to see if score is different from what we have saved
		goals = playbyplay["liveData"]["plays"]["scoringPlays"]

		for goalindex in range(0, len(goals)):
			goal = goals[goalindex]
			gamekey = game["gamePk"]
			if gamekey not in reported:
				reported[gamekey] = []

			while len(reported[gamekey]) > len(goals):
				stringsToAnnounce.append("Last goal in " + away + "-" + home + " disallowed (beta feature, report to SPRX97 if incorrect).")
				reported[gamekey] = reported[gamekey][:-1]

			goalkey = playbyplay["liveData"]["plays"]["allPlays"][goal]["about"]["eventId"]
			if goalkey not in reported[game["gamePk"]]:
				goal = playbyplay["liveData"]["plays"]["allPlays"][goal]
				if "(0)" in goal["result"]["description"]:
					continue # not complete yet. Wait a cycle

				gamegoalkey = str(gamekey) + ":" + str(goalkey)
				if gamegoalkey in waiting:
					waiting[gamegoalkey] += 1
					if waiting[gamegoalkey] <= 2 and "assists: none" in goal["result"]["description"]:
						continue # assists still haven't been reported, so keep waiting
				elif "assists: none" in goal["result"]["description"]:
					waiting[gamegoalkey] = 0
					continue # skip  for now because assists haven't been reported
				waiting.pop(gamegoalkey, None)

				strength = "(" + goal["result"]["strength"]["code"] + ") "
				if strength == "(EVEN) ":
					strength = ""
				en = ""
				if "emptyNet" in goal["result"] and goal["result"]["emptyNet"]:
					en = "(EN) "

				team = emojis[goal["team"]["triCode"]] + " " + goal["team"]["triCode"]
				period = "(" + goal["about"]["ordinalNum"] + ")"
				time = goal["about"]["periodTime"] + " " + goal["about"]["ordinalNum"]

				score = "(" + away + " " + str(awayScore) + ", " + home + " " + str(homeScore) + ")"

				stringsToAnnounce.append("GOAL " + strength + en + team + " " + time + ": " + goal["result"]["description"] + " " + score)
				reported[gamekey].append(goalkey)

		# print final result
		if isFinal and key not in completed:
			if playbyplay["liveData"]["plays"]["allPlays"][-1]["result"]["eventTypeId"] == "GAME_END":
				awayScore = playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["goals"]["away"]
				homeScore = playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["goals"]["home"]
				period = "(" + playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["ordinalNum"] + ")"
				if period == "(3rd)":
					period = ""
				finalstring = emojis[away] + " " + away + " " + str(awayScore) + ", " + emojis[home] + " " + home + " " + str(homeScore) + " Final " + period
				stringsToAnnounce.append(finalstring)
				completed.append(key)

	cycles += 1
	return stringsToAnnounce

if __name__ == "__main__":
	date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
	for s in parseScoreboard(date):
		print(s)
