import discord
import asyncio
import threading
import datetime
import sys
import time
import MySQLdb
import urllib.request # url reading
from lxml import etree
from lxml import html # xml parsing
import json

import ParseFeeds
import CheckTradeEmails

# team name mappings, ALL LOWERCASE
team_map = {}
team_map["ari"] = team_map["arizona"] = team_map["phx"] = team_map["phoenix"] = team_map["coyotes"]			= "ARI"
team_map["ana"] = team_map["anaheim"] = team_map["ducks"]								= "ANA"
team_map["bos"] = team_map["boston"] = team_map["bruins"]								= "BOS"
team_map["buf"] = team_map["buffalo"] = team_map["sabres"]								= "BUF"
team_map["cgy"] = team_map["cal"] = team_map["calgary"] = team_map["flames"]						= "CGY"
team_map["car"] = team_map["carolina"] = team_map["canes"] = team_map["hurricanes"]					= "CAR"
team_map["chi"] = team_map["chicago"] = team_map["hawks"] = team_map["blackhawks"]					= "CHI"
team_map["col"] = team_map["colorado"] = team_map["avs"] = team_map["avalanche"]					= "COL"
team_map["cbj"] = team_map["columbus"] = team_map["jackets"] = team_map["blue jackets"]					= "CBJ"
team_map["dal"] = team_map["dallas"] = team_map["stars"]								= "DAL"
team_map["det"] = team_map["detroit"] = team_map["wings"] = team_map["red wings"]					= "DET"
team_map["edm"] = team_map["edmonton"] = team_map["oilers"]								= "EDM"
team_map["fla"] = team_map["flo"] = team_map["florida"] = team_map["panthers"]						= "FLO"
team_map["lak"] = team_map["la"] = team_map["los angeles"] = team_map["kings"]						= "LAK"
team_map["min"] = team_map["minnesota"] = team_map["wild"]								= "MIN"
team_map["mtl"] = team_map["mon"] = team_map["montreal"] = team_map["canadiens"] = team_map["habs"]			= "MTL"
team_map["nsh"] = team_map["nas"] = team_map["nashville"] = team_map["predators"] = team_map["preds"]			= "NSH"
team_map["njd"] = team_map["nj"] = team_map["new jersey"] = team_map["jersey"] = team_map["devils"]			= "NJD"
team_map["nyi"] = team_map["new york islanders"] = team_map["islanders"]						= "NYI"
team_map["nyr"] = team_map["new york rangers"] = team_map["rangers"]							= "NYR"
team_map["ott"] = team_map["ottawa"] = team_map["sens"] = team_map["senators"]						= "OTT"
team_map["phi"] = team_map["philadelphia"] = team_map["philly"] = team_map["flyers"]					= "PHI"
team_map["pit"] = team_map["pittsburgh"] = team_map["pens"] = team_map["penguins"]					= "PIT"
team_map["stl"] = team_map["st. louis"] = team_map["st louis"] = team_map["saint louis"] = team_map["blues"]		= "STL"
team_map["sjs"] = team_map["sj"] = team_map["san jose"] = team_map["sharks"]						= "SJS"
team_map["tbl"] = team_map["tb"] = team_map["tampa bay"] = team_map["tampa"] = team_map["bolts"] = team_map["lightning"]= "TBL"
team_map["tor"] = team_map["toronto"] = team_map["leafs"] = team_map["maple leafs"]					= "TOR"
team_map["van"] = team_map["vancouver"] = team_map["canucks"] = team_map["nucks"]					= "VAN"
team_map["vgk"] = team_map["vegas"] = team_map["las vegas"] = team_map["golden knights"] = team_map["knights"]		= "VGK"
team_map["wsh"] = team_map["was"] = team_map["washington"] = team_map["capitals"] = team_map["caps"]			= "WSH"
team_map["wpj"] = team_map["wpg"] = team_map["winnipeg"] = team_map["jets"]						= "WPJ"

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

client = discord.Client()
soft_reset = 0 # temporarily set to > 0 to avoid printing stuff once

@asyncio.coroutine
def check_scores():
	global soft_reset

	bot_channel = None
	for channel in client.get_all_channels():
		if channel.name == "general":
			bot_channel = channel

#	if soft_reset == 0:
#		yield from client.send_message(bot_channel, "Scorebot reset... Sorry for the spam!")

	# repeat the task every 15 seconds
	while not client.is_closed:
		date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
		try:
			announcements, edits = ParseFeeds.parseScoreboard(date)
			if soft_reset == 0:
				for (key, str) in announcements:
					msg = yield from client.send_message(bot_channel, str)
					if key != None:
						ParseFeeds.messages[key][1] = msg
				for msg in edits:
					yield from client.edit_message(msg, edits[msg])
		except Exception as e:
			print("Error: %s" % e)

		if soft_reset > 0:
			soft_reset -= 1

		yield from asyncio.sleep(5)

	if client.is_closed:
		print("CLIENT CLOSED UNEXPECTEDLY")

@asyncio.coroutine
def check_trade_emails():
	bot_channel = None
	for channel in client.get_all_channels():
		if channel.name == "tradereview":
			bot_channel = channel

	# repeat the task every hour
	while not client.is_closed:
		announcements = CheckTradeEmails.checkEmails()
		for str in announcements:
			str = "<@&235926008266620929> " + str
			yield from client.send_message(bot_channel, str)

		yield from asyncio.sleep(1800)

	if client.is_closed:
		print("CLIENT CLOSED UNEXPECTEDLY")

@client.event
@asyncio.coroutine 
def on_ready():
#	print("Logged in as")
#	print(client.user.name)
#	print(client.user.id)
#	print("---------")

#	fp = open("/var/www/roldtimehockey/scripts/wes.jpg", "rb")
#	yield from client.edit_profile(password=None, avatar=fp.read())

	client.loop.create_task(check_scores())
	client.loop.create_task(check_trade_emails())
	return

@client.event
@asyncio.coroutine
def on_message(message):
	# don't replay to self
	if message.author == client.user:
		return

#	print(message.author)
#	print(message.server)
#	print(message.channel)
#	print(message.content)
#	print("---------")

	# Ping response
	if message.content.startswith("!ping"):
		yield from client.send_message(message.channel, "pong")

	# Pong response
	if message.content.startswith("!pong"):
		yield from client.send_message(message.channel, "ping")

	# Reset response
#	if message.content.startswith("!reset") and (message.channel.name == "mods" or message.channel.name == "bot-test"):
#		yield from client.send_message(message.channel, "Rebooting bot")
#		print("Bot reset from client by " + message.author)
#		loop.run_until_complete(client.logout())
#		client.close()
#		quit()

	# Trades response
	if message.content.startswith("!trades") and (message.channel.name == "bot-test" or message.channel.name == "tradereview"):
		bot_channel = None
		for channel in client.get_all_channels():
			if channel.name == "tradereview":
				bot_channel = channel

		announcements = CheckTradeEmails.checkEmails()
		for str in announcements:
         		yield from client.send_message(bot_channel, str)

		yield from client.send_message(message.channel, "Done checking trades")


	# Fantasy matchup check response
	if message.content.startswith("!matchup"):
		if len(message.content.split(" ")) == 1:
			yield from client.send_message(message.channel, "Usage: !matchup <fleaflicker username>")
		else:
			# might be slow if opening too many DB connections
			db = MySQLdb.connect(host="localhost", user="othuser", passwd="othpassword", db="OldTimeHockey")
			cursor = db.cursor()
			team = message.content.split(" ")[1].lower()
			cursor.execute("SELECT me_u.FFname, me.currentWeekPF, opp_u.FFname, opp.currentWeekPF FROM Teams AS me " + \
				       "INNER JOIN Teams AS opp ON me.CurrOpp=opp.teamID " + \
				       "INNER JOIN Users AS me_u ON me.ownerID=me_u.FFid " + \
				       "INNER JOIN Users AS opp_u ON opp.ownerID=opp_u.FFid " + \
				       "WHERE LOWER(me_u.FFname)='" + team + "'")

			results = cursor.fetchall()
			if len(results) == 0:
				yield from client.send_message(message.channel, "User " + team + " not found.");
			else:
				yield from client.send_message(message.channel, "%s %0.2f, %s %0.2f" % (results[0][0], results[0][1], results[0][2], results[0][3]))

			cursor.close()
			db.close()

	# Woppa cup check response
#
#	I think this will be a lot easier once the Challonge API v2 is out. That should allow me to just
#	make calls instead of having to scrape the page.
#
	if message.content.startswith("!woppacup"):
		if len(message.content.split(" ")) == 1:
			yield from client.send_message(message.channel, "Usage: !woppacup <fleaflicker username>")
		else:
			myteam = message.content.split(" ")[1]

			f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
			year = int(f.readline().strip()) + 1

			# might need selenium or scrapy for delay load
			url = "http://challonge.com/woppacup%d" % (year)
			req = urllib.request.Request(url, headers={"User-Agent" : "Magic Browser"})
			response = urllib.request.urlopen(req)
			page = response.read()
			root = html.document_fromstring(page)

			if root.cssselect("li.active")[0].text_content() == "Final Stage":
				matches = root.cssselect(".match.-open")
				yield from client.send_message(message.channel, "%d" % (len(matches)))
#				for match in matches:
#					team1 = match.cssselect(".match--player-name")[0].text_content().split(".")[-1]
#					team2 = match.cssselect(".match--player-name")[1].text_content().split(".")[-1]
#					yield from client.send_message(message.channel, "%s %s" % (team1, team2))
#
			yield from client.send_message(message.channel, "DONE")

	# Score check response
	if message.content.startswith("!score"):
		if len(message.content.split(" ")) == 1:
			yield from client.send_message(message.channel, "Usage: !score <team>")
		else:
			team = (" ".join(message.content.split(" ")[1:])).lower()
			if team in team_map.keys():
				team = team_map[team]
				date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")

				try:
					root = ParseFeeds.getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
				except Exception as e:
					yield from client.send_message(message.channel, "Failed to find feed")
					return

				games = root["dates"][0]["games"]

				found = False
				for game in games:
					away = team_map[game["teams"]["away"]["team"]["name"].split(" ")[-1].lower()]
					home = team_map[game["teams"]["home"]["team"]["name"].split(" ")[-1].lower()]
					if home == team or away == team:
						opp = home
						if home == team:
							opp = away

						if game["status"]["detailedState"] == "Scheduled" or game["status"]["detailedState"] == "Pre-Game":
							yield from client.send_message(message.channel, emojis[team] + " " + team + "'s game against " + emojis[opp] + " " + opp + " has not started yet.")
						else:
							period = "(" + game["linescore"]["currentPeriodOrdinal"] + ")"
							awayScore = game["teams"]["away"]["score"]
							homeScore = game["teams"]["home"]["score"]
							if game["status"]["detailedState"] == "Final":
								if period == "(3rd)":
									period = ""
								yield from client.send_message(message.channel, "Final: %s %s %s, %s %s %s %s" % (emojis[away], away, awayScore, emojis[home], home, homeScore, period))
							else:
								timeleft = game["linescore"]["currentPeriodTimeRemaining"]
								period = period[:-1] + " " + timeleft + period[-1]
								yield from client.send_message(message.channel, "Current score: %s %s %s, %s %s %s %s" % (emojis[away], away, awayScore, emojis[home], home, homeScore, period))

						found = True
						break

				if not found:
					yield from client.send_message(message.channel, "I do not think " + emojis[team] + " " + team + " plays tonight.")
			else:
				yield from client.send_message(message.channel, "I do not recognize the team '" + team + "'")

if __name__ == "__main__":
	if len(sys.argv) > 1:
		if sys.argv[1] == "soft":
			soft_reset = 4
	client.run("MjUwODI2MTA5MjE2NjIwNTQ1.CxahLA.OkcmOowsvtCQkwt2WEAbCt5yJsk")
