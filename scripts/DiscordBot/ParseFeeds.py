import urllib.request
import base64
import datetime
import json
import sys
import pickle

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
emojis["SEA"] = "<:SEA:747291968681541682>"
emojis["STL"] = "<:STL:269315296328679436>"
emojis["SJS"] = "<:SJS:269315542509289472>"
emojis["TBL"] = "<:TBL:269315471919022090>"
emojis["TOR"] = "<:TOR:645064999659896842>"
emojis["VAN"] = "<:VAN:269315315194658818>"
emojis["VGK"] = "<:VGK:363836502859448320>"
emojis["WSH"] = "<:WSH:269327070977458181>"
emojis["WPG"] = "<:WPJ:269315448833703946>"
emojis["WPJ"] = "<:WPJ:269315448833703946>"
emojis["goal"] = "<a:goalsiren:750190349963624510>"
emojis["parros"] = "<:parros:372533524286275597>"

pickled = {}

# Gets the emoji for a team or returns blank
def getEmoji(team):
	if team in emojis:
		return emojis[team]
	return ""

# Gets the feed using the new NHL.com API
def getFeed(url):
	request = urllib.request.Request(url)
	response = urllib.request.urlopen(request)
	return json.loads(response.read().decode())

def FindMediaLink(key):
	try:
		gameid, eventid = key.split(":")
		media = getFeed("https://statsapi.web.nhl.com/api/v1/game/" + gameid + "/content")
		for event in media["media"]["milestones"]["items"]:
			if event["statsEventId"] == eventid:
				return event["highlight"]["playbacks"][3]["url"] # 3 = FLASH_1800K_896x504
	except:
		return None

def FindRecapLink(key):
	try:
		gameid = key.split(":")[0]
		media = getFeed("https://statsapi.web.nhl.com/api/v1/game/" + gameid + "/content")
		for item in media["media"]["epg"]:
			if item["title"] == "Recap":
				return item["items"][0]["playbacks"][3]["url"] # 3 = FLASH_1800K_896x504
	except:
		return None

def parseGame(game):
	global pickled

	# List of messages to send/update in the channel
	stringsToAnnounce = []

	# Get the game from NHL.com
	playbyplayURL = "https://statsapi.web.nhl.com" + game["link"]
	try:
		playbyplay = getFeed(playbyplayURL)
	except Exception as e:
		print("Failed to find feed.")
		return [], {}

	away = playbyplay["gameData"]["teams"]["away"]["abbreviation"]
	home = playbyplay["gameData"]["teams"]["home"]["abbreviation"]
	key = str(playbyplay["gamePk"])

	# Check whether the game start notification needs to be sent
	isInProgress = playbyplay["gameData"]["status"]["detailedState"] == "In Progress"
	startkey = key + ":S"
	if isInProgress and startkey not in pickled:
		startstring = getEmoji(away) + " " + away + " at " + getEmoji(home) + " " + home + " Starting."
		stringsToAnnounce.append(startkey)
		pickled[startkey] = {"msg_id":None, "msg_text":startstring, "msg_link":None}

###################################################################################

	# Get list of scoring plays
	goals = playbyplay["liveData"]["plays"]["scoringPlays"]

	# Loop through all of our pickled goals
	# If one of them doesn't exist in the list of scoring plays anymore
	# We should cross it out and notify that it was disallowed.
	for picklekey in list(pickled.keys()): # Use list() to force a copy to be made and avoid "dictionary changed size during iteration" error
		gameid, eventid = picklekey.split(":")

		# Skip goals from other games, or start, end, and disallow events
		if gameid != key or eventid == "S" or eventid == "E" or eventid[-1] == "D":
			continue

		found = False
		for goal in goals:
			if eventid == str(playbyplay["liveData"]["plays"]["allPlays"][goal]["about"]["eventId"]):
				found = True
				break

		# This goal is still there, no need to disallow
		if found:
			continue

		if pickled[picklekey]["msg_text"][0] != "~":
			pickled[picklekey]["msg_text"] = "~~" + pickled[picklekey]["msg_text"] + "~~"
			stringsToAnnounce.append(picklekey)

			disallowkey = picklekey + "D"
			if disallowkey not in pickled:
				pickled[disallowkey] = {"msg_id":None, "msg_text":"Last goal disallowed in " + away + "-" + home + ".", "msg_link":None}
				stringsToAnnounce.append(disallowkey)

	# Check all the goals to report new ones
	for goal in goals:
		goal = playbyplay["liveData"]["plays"]["allPlays"][goal]
		goalkey = key + ":" + str(goal["about"]["eventId"])

		# Find the strength of the goal
		strength = "(" + goal["result"]["strength"]["code"] + ") "
		if strength == "(EVEN) ":
			strength = ""
		if "emptyNet" in goal["result"] and goal["result"]["emptyNet"]:
			strength += "(EN) "

		# Find the team that scored the goal
		teamcode = goal["team"]["triCode"]
		team = getEmoji(teamcode) + " " + teamcode + " "

		# Find the period and time the goal was scored in
		time = goal["about"]["periodTime"] + " " + goal["about"]["ordinalNum"]

		# Create the full string to post to chat
		goalstr = getEmoji("goal") + " GOAL " + strength + team + time + ": " + goal["result"]["description"]
		score = "(" + away + " " + str(goal["about"]["goals"]["away"]) + ", " + home + " " + str(goal["about"]["goals"]["home"]) + ")"
		goalstr += " " + score

		# If the goal has already been reported, but been updated, edit the post
		if goalkey in pickled and pickled[goalkey]["msg_text"] != goalstr:
			stringsToAnnounce.append(goalkey)
#			print("Edit found:", pickled[goalkey]["msg_text"], len(pickled[goalkey]["msg_text"]))
#			print("Original:  ", goalstr, len(goalstr))
#			print(goalstr == pickled[goalkey]["msg_text"])
			pickled[goalkey]["msg_text"] = goalstr
		elif goalkey not in pickled: # If the goal has not been reported, post it
			stringsToAnnounce.append(goalkey)
			pickled[goalkey] = { "msg_id":None, "msg_text":goalstr, "msg_link":None }

		if pickled[goalkey]["msg_link"] == None:
			pickled[goalkey]["msg_link"] = FindMediaLink(goalkey)
			if pickled[goalkey]["msg_link"] != None and goalkey not in stringsToAnnounce:
#				print("Link found:", pickled[goalkey]["msg_link"])
				stringsToAnnounce.append(goalkey)

#########################################################################################

	# Check whether the game finished notification needs to be sent
	isFinal = playbyplay["gameData"]["status"]["detailedState"] == "Final"
	endkey = key + ":E"
	if isFinal and endkey not in pickled:
		# Some exhibition games don't get play-by-play data. Skip these.
		if len(playbyplay["liveData"]["plays"]["allPlays"]) == 0:
			pass
		elif playbyplay["liveData"]["plays"]["allPlays"][-1]["result"]["eventTypeId"] == "GAME_END" or playbyplay["liveData"]["plays"]["allPlays"][-1]["result"]["eventTypeId"] == "GAME_OFFICIAL":
			awayScore = playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["goals"]["away"]
			homeScore = playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["goals"]["home"]

			# Sometimes shootout winners take longer to report, so allow this to defer to the next cycle
			skip = False
			if awayScore == homeScore: # adjust for shootout winner
				if playbyplay["liveData"]["linescore"]["shootoutInfo"]["away"]["scores"] > playbyplay["liveData"]["linescore"]["shootoutInfo"]["home"]["scores"]:
					awayScore += 1
				elif playbyplay["liveData"]["linescore"]["shootoutInfo"]["away"]["scores"] < playbyplay["liveData"]["linescore"]["shootoutInfo"]["home"]["scores"]:
					homeScore += 1
				else:
					skip = True

			# Report the final score, including the OT/SO tag
			if not skip:
				period = "(" + playbyplay["liveData"]["plays"]["allPlays"][-1]["about"]["ordinalNum"] + ")"
				if period == "(3rd)": # No additional tag for a regulation final
					period = ""
				finalstring = getEmoji(away) + " " + away + " " + str(awayScore) + ", " + getEmoji(home) + " " + home + " " + str(homeScore) + " Final " + period
				stringsToAnnounce.append(endkey)
				pickled[endkey] = {"msg_id":None, "msg_text":finalstring, "msg_link":None}

	if isFinal and pickled[endkey]["msg_link"] == None:
		pickled[endkey]["msg_link"] = FindRecapLink(endkey)
		if pickled[endkey]["msg_link"] != None:
			stringsToAnnounce.append(endkey)

	return stringsToAnnounce

def UpdateMessageId(key, msg_id):
	global pickled
	pickled[key]["msg_id"] = msg_id

def ReadPickleFile():
	global pickled
	with open("messages.pickle", "rb") as f:
		try:
			pickled = pickle.load(f)
		except EOFError:
			pickled = {}

def WritePickleFile():
	global pickled
	with open("messages.pickle", "wb") as f:
		pickle.dump(pickled, f)

def ClearPickleFile():
	global pickled
	pickled = {}
	WritePickleFile()

#################### LOCAL TESTING ONLY #####################################################

# parses the NHL scoreboard for a given date
def parseScoreboard(date): # YYYY-mm-dd format
	global pickled

	ReadPickleFile()

	try:
		root = getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
	except Exception as e:
		print("Failed to find feed.")
		return [], {}

	stringsToAnnounce = []

	games = root["dates"][0]["games"]
	for game in games:
		ann = parseGame(game)
		stringsToAnnounce.extend(ann)

	WritePickleFile()

	return stringsToAnnounce

if __name__ == "__main__":
	date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
	for s in parseScoreboard(date):
		print(s)
