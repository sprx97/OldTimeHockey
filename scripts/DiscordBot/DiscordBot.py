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
import os
import pickle

import ParseFeeds
import CheckTrades
import CheckInactives

sys.path.append("..")
import Config

OTH_SERVER_ID = 207634081700249601
KK_SERVER_ID = 742845693785276576

OTH_TECH_CHANNEL_ID = 489882482838077451
HOCKEY_GENERAL_CHANNEL_ID = 507616755510673409
TRADEREVIEW_CHANNEL_ID = 235926223757377537
MODS_CHANNEL_ID = 220663309786021888
GUAVAS_AND_APPLES_CHANNEL_ID = 747906611959562280


# team name mappings, ALL LOWERCASE
team_map = {}
team_map["ari"] = team_map["arizona"] = team_map["phx"] = team_map["phoenix"] = team_map["coyotes"]                      = "ARI"
team_map["ana"] = team_map["anaheim"] = team_map["ducks"]                                                                = "ANA"
team_map["bos"] = team_map["boston"] = team_map["bruins"]                                                                = "BOS"
team_map["buf"] = team_map["buffalo"] = team_map["sabres"]                                                               = "BUF"
team_map["cgy"] = team_map["cal"] = team_map["calgary"] = team_map["flames"]                                             = "CGY"
team_map["car"] = team_map["carolina"] = team_map["canes"] = team_map["hurricanes"]                                      = "CAR"
team_map["chi"] = team_map["chicago"] = team_map["hawks"] = team_map["blackhawks"]                                       = "CHI"
team_map["col"] = team_map["colorado"] = team_map["avs"] = team_map["avalanche"]                                         = "COL"
team_map["cbj"] = team_map["columbus"] = team_map["jackets"] = team_map["blue jackets"]                                  = "CBJ"
team_map["dal"] = team_map["dallas"] = team_map["stars"]                                                                 = "DAL"
team_map["det"] = team_map["detroit"] = team_map["wings"] = team_map["red wings"]                                        = "DET"
team_map["edm"] = team_map["edmonton"] = team_map["oilers"]                                                              = "EDM"
team_map["fla"] = team_map["flo"] = team_map["florida"] = team_map["panthers"]                                           = "FLA"
team_map["lak"] = team_map["la"] = team_map["los angeles"] = team_map["kings"]                                           = "LAK"
team_map["min"] = team_map["minnesota"] = team_map["wild"]                                                               = "MIN"
team_map["mtl"] = team_map["mon"] = team_map["montreal"] = team_map["canadiens"] = team_map["habs"]                      = "MTL"
team_map["nsh"] = team_map["nas"] = team_map["nashville"] = team_map["predators"] = team_map["preds"]                    = "NSH"
team_map["njd"] = team_map["nj"] = team_map["new jersey"] = team_map["jersey"] = team_map["devils"]                      = "NJD"
team_map["nyi"] = team_map["new york islanders"] = team_map["islanders"]                                                 = "NYI"
team_map["nyr"] = team_map["new york rangers"] = team_map["rangers"]                                                     = "NYR"
team_map["ott"] = team_map["ottawa"] = team_map["sens"] = team_map["senators"]                                           = "OTT"
team_map["phi"] = team_map["philadelphia"] = team_map["philly"] = team_map["flyers"]                                     = "PHI"
team_map["pit"] = team_map["pittsburgh"] = team_map["pens"] = team_map["penguins"]                                       = "PIT"
team_map["sea"] = team_map["seattle"] = team_map["kraken"]                                                               = "SEA"
team_map["stl"] = team_map["st. louis"] = team_map["st louis"] = team_map["saint louis"] = team_map["blues"]             = "STL"
team_map["sjs"] = team_map["sj"] = team_map["san jose"] = team_map["sharks"]                                             = "SJS"
team_map["tbl"] = team_map["tb"] = team_map["tampa bay"] = team_map["tampa"] = team_map["bolts"] = team_map["lightning"] = "TBL"
team_map["tor"] = team_map["toronto"] = team_map["leafs"] = team_map["maple leafs"]                                      = "TOR"
team_map["van"] = team_map["vancouver"] = team_map["canucks"] = team_map["nucks"]                                        = "VAN"
team_map["vgk"] = team_map["vegas"] = team_map["las vegas"] = team_map["golden knights"] = team_map["knights"]           = "VGK"
team_map["wsh"] = team_map["was"] = team_map["washington"] = team_map["capitals"] = team_map["caps"]                     = "WSH"
team_map["wpj"] = team_map["wpg"] = team_map["winnipeg"] = team_map["jets"]                                              = "WPJ"

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())

client = discord.Client(heartbeat_timeout=120.0)

@asyncio.coroutine
def PrintOTStandings(guild, channel):
	with open("otstandings.pickle", "rb") as f:
		try:
			pickled = pickle.load(f)
		except EOFError:
			yield from channel.send("Unable to read standings.")
			return

		if guild not in pickled:
			yield from channel.send("No standings for this server.")
			return

		standings = pickled[guild]
		msg =  "``"
		msg += "User          | Wins | Guesses\n"
		msg += "--------------|------|--------\n"
		for author in standings:
			author_name = client.get_guild(guild).get_member(author).name + "              "
			wins = str(standings[author][0]) + "      "
			guesses = str(standings[author][1]) + "        "

			author_name = author_name[:14]
			wins = wins[:6]
			guesses = guesses[:8]
			
			msg += author_name + "|" + wins + "|" + guesses + "\n"

		msg += "``"
		yield from channel.send(msg)

@asyncio.coroutine
def ProcessOTGuesses():
	standings_file = open("otstandings.pickle", "rb")
	try:
		standings = pickle.load(standings_file)
	except:
		print("Failed to load OT standings. ABORTING.")
		return

	with open("ot.pickle", "rb+") as f:
		try:
			pickled = pickle.load(f)
		except EOFError:
			pickled = {}

#		pickled[(2019030316, 207634081700249601, 228258453599027200)] = ('TBL', 8478010)
#		pickled[(2019030316, 207634081700249601, 222830283399888897)] = ('TBL', 8476883)
#		pickled[(2019030316, 207634081700249601, 132963280351264768)] = ('TBL', 8475167)
		# This may be a bit slow, since I'm re-loading the game for each
		# guess, instead of processing all guesses for a game, but it shouldn't matter.
		for guess in pickled:
			game = guess[0]
			guild = guess[1]
			author = guess[2]
			author_name = client.get_guild(guild).get_member(author).name
			team = pickled[guess][0]
			player = pickled[guess][1]

			# Load boxscore from NHL.com and pull the scorer of the last goal in this game.
			try:
				playbyplay = ParseFeeds.getFeed("https://statsapi.web.nhl.com/api/v1/game/" + str(game) + "/feed/live")
			except Exception as e:
				print("Failed to find game feed. " + str(e))
				continue

			# Check that the GWG play exists -- may trigger in a 0-0 shootout game
			try:
				goal = playbyplay["liveData"]["plays"]["scoringPlays"][-1]
				goal = playbyplay["liveData"]["plays"]["allPlays"][goal]
			except:
				print("Failed to find GWG play. " + str(e))
				continue

			# Check that game didn't end late in the 3rd or in a shootout
			if goal["about"]["periodType"] != "OVERTIME":
				print(team + " game did not end in OT.")
				continue

			# See if the player was guessed correctly
			correct = 0
			scorer_name = goal["players"][0]["player"]["fullName"]
			if goal["team"]["triCode"] == team and goal["players"][0]["player"]["id"] == player:
				print(author_name + " CORRECT for " + team + " " + scorer_name)
				correct = 1
			else:
				print(author_name + " INCORRECT for " + team + " " + scorer_name)

			# Update the standings for this user
			if guild not in standings:
				standings[guild] = {}
			
			if author not in standings[guild]:
				standings[guild][author] = [0, 0]

			standings[guild][author][0] += correct
			standings[guild][author][1] += 1

		with open("otstandings.pickle", "wb") as f2:
			for g in standings:
				standings[g] = {k  : v for k, v in sorted(standings[g].items(), key=lambda item: item[1][0], reverse=True)}
			pickle.dump(standings, f2)

		# Reset file for tomorrow
		pickled = {}
		f.seek(0)
		f.truncate()
		pickle.dump(pickled, f)

		for channel in client.get_all_channels():
			if channel.id == OTH_TECH_CHANNEL_ID: # change to hockey-general soonish
				yield from PrintOTStandings(OTH_SERVER_ID, channel)
#			elif channel.id == GUAVAS_AND_APPLES_CHANNEL_ID:
#				yield from PrintOTStandings(KK_SERVER_ID, channel)

@asyncio.coroutine
def check_scores():
	bot_channels = []
	for channel in client.get_all_channels():
		if channel.id == HOCKEY_GENERAL_CHANNEL_ID and channel.guild.id == OTH_SERVER_ID:
			bot_channels.append(channel)
		elif channel.id == GUAVAS_AND_APPLES_CHANNEL_ID and channel.guild.id == KK_SERVER_ID:
			bot_channels.append(channel)
#		if channel.id == OTH_TECH_CHANNEL_ID and channel.guild.id == OTH_SERVER_ID:
#			bot_channels.append(channel)

	# repeat the task every 10 seconds
	lastdate = None
	while not client.is_closed():
		date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
		if lastdate == None:
			lastdate = date
		if lastdate != date: # date has rolled over. Clear picklefile
			print("============ DATE ROLLOVER", date, "============")
			ParseFeeds.ClearPickleFile()
			yield from ProcessOTGuesses()
			lastdate = date

		try:
			ParseFeeds.ReadPickleFile()

			root = ParseFeeds.getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")

			stringsToAnnounce = []

			if len(root["dates"]) > 0:
				games = root["dates"][0]["games"]
				for game in games:
					ann = ParseFeeds.parseGame(game)
					stringsToAnnounce.extend(ann)
					yield from asyncio.sleep(.25)

				for key in stringsToAnnounce:
					embed = discord.Embed(title=ParseFeeds.pickled[key]["msg_text"], url=ParseFeeds.pickled[key]["msg_link"])
					if ParseFeeds.pickled[key]["msg_id"] == None:
						msgids = []
						for channel in bot_channels:
							msg = yield from channel.send(embed=embed)
							msgids.append(msg.id)
							print("Post:", msg.id, embed.title)
						ParseFeeds.UpdateMessageId(key, msgids)
					else:
						for msgid in ParseFeeds.pickled[key]["msg_id"]:
							msg = None
							for channel in bot_channels:
								try:
									msg = yield from channel.fetch_message(msgid)
								except:
									continue
							if msg != None:
								print("Edit:", msg.id, embed.title)
								yield from msg.edit(embed=embed)

			ParseFeeds.WritePickleFile()

		except Exception as e:
			print("Error: %s" % e)
			ParseFeeds.WritePickleFile() # Write whatever we've sent so far to hopefully prevent spamming.
			sys.stdout.flush()

		yield from asyncio.sleep(10)

	if client.is_closed():
		print("CLIENT CLOSED UNEXPECTEDLY")

@asyncio.coroutine
def check_inactives():
	bot_channel = None
	for channel in client.get_all_channels():
		if channel.id == MODS_CHANNEL_ID:
			bot_channel = channel

	# repeat the task every week
	while not client.is_closed():
		updated = CheckInactives.checkAllLeagues(False) # no force
		unclaimed = CheckInactives.unclaimed
		inactives = CheckInactives.inactives
		if not updated:
			pass
		elif len(inactives) == 0 and len(unclaimed) == 0:
			yield from bot_channel.send("No inactive or unclaimed teams in any league currently!")
		else:
			body = ""
			for league in unclaimed:
				body += str(unclaimed[league]) + " unclaimed team(s) in " + league + "\n"

			if body != "":
				body += "\n"
			else:
				body += "No unclaimed teams.\n\n"

			count = 0
			for league in inactives:
				body += str(len(inactives[league])) + " inactive(s) in " + league + "\n"
				count += len(inactives[league])
				for user in inactives[league]:
					body += "\t" + user + "\n"
				body += "\n"
			if count == 0:
				body += "No inactive teams.\n"

			yield from bot_channel.send(body)

		yield from asyncio.sleep(43200)

@asyncio.coroutine
def check_trades():
	bot_channel = None
	for channel in client.get_all_channels():
		if channel.id == TRADEREVIEW_CHANNEL_ID:
			bot_channel = channel

	# repeat the task every hour
	while not client.is_closed():
		announcements = CheckTrades.checkFleaflickerTrades()
		for mystr in announcements:
			mystr = "<@&235926008266620929>\n" + mystr
			yield from bot_channel.send(mystr)

		yield from asyncio.sleep(3600)

#	if client.is_closed:
#		print("CLIENT CLOSED UNEXPECTEDLY")

@client.event
@asyncio.coroutine
def on_ready():
	# Uncomment these to change some basic things about the bot account (avatar, status, nickname)
#	fp = open(Config.config["srcroot"] + "scripts/wes.jpg", "rb")
#	yield from client.edit_profile(password=None, avatar=fp.read())
#	yield from client.change_presence(activity=discord.Game(name="NHL '94"))
#	yield from client.change_nickname(client.user, "Wes McCauley")

	client.loop.create_task(check_scores())
	client.loop.create_task(check_trades())
	client.loop.create_task(check_inactives())
	return

@client.event
@asyncio.coroutine
def on_message(message):
	# don't reply to self
	if message.author == client.user:
		return

######################## Core Responses ######################################
	# Ping response
	if message.content.startswith("!ping"):
		yield from message.channel.send("pong")

	# Pong response
	if message.content.startswith("!pong"):
		yield from message.channel.send("ping")

	# Killswitch
	if message.content.startswith("!kill") and message.channel.id == OTH_TECH_CHANNEL_ID:
		yield from client.close()
		print("Bot shutdown via command.")
		while True:
			continue # Freeze the bot until I manually restart it

	# Help response
	if message.content.startswith("!help"):
		if message.guild.id == OTH_SERVER_ID:
			yield from message.channel.send("I'm Wes McCauley, the official referee of /r/OldTimeHockey. Here are some of the commands I respond to:\n" + \
							"**!help**\n\tDisplays this list of commands.\n" + \
							"**!ping or !pong**\n\tGets a response to check that bot is up.\n" + \
							"**!matchup <fleaflicker username>**\n\tPosts the score of the user's fantasy matchup this week.\n" + \
							"**!score <NHL team>**\n\tPosts the score of the given NHL team's game tonight. Accepts a variety of nicknames and abbreviations." + \
							"\t!ot <NHL team> <player number>: Allows you to predict a player to score the OT winner. Must be done between 2 minutes left" + \
							"in the 3rd period and the start of OT of a tied game. Can only guess one player per game." + \
							"\t!ot standings: Displays the standings for the season-long OT prediction contest on this server.")
		else:
			yield from message.channel.send("!help: Displays this list of commands.\n" + \
							"!ping or !pong: Gets a response to check that the bot is up.\n" + \
							"!score <NHL team>: Posts the score of the given NHL team's game tonight. Accepts a variety of nicknames and abbreviations." + \
							"\t!ot <NHL team> <player number>: Allows you to predict a player to score the OT winner. Must be done between 2 minutes left" + \
							"in the 3rd period and the start of OT of a tied game. Can only guess one player per game." + \
							"\t!ot standings: Displays the standings for the season-long OT prediction contest on this server.")

	# Score check response
	if message.content.startswith("!score"):
		if len(message.content.split(" ")) == 1:
			yield from message.channel.send("Usage: !score <team>")
		else:
			team = (" ".join(message.content.split(" ")[1:])).lower()
			if team in team_map.keys():
				team = team_map[team]
				date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")

				try:
					root = ParseFeeds.getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
				except Exception as e:
					yield from message.channel.send("Failed to find feed")
					return

				if len(root["dates"]) == 0:
					yield from message.channel.send("No games today " + ParseFeeds.emojis["parros"])
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
							yield from message.channel.send(ParseFeeds.emojis[team] + " " + team + "'s game against " + ParseFeeds.emojis[opp] + " " + opp + " has not started yet.")
						else:
							period = "(" + game["linescore"]["currentPeriodOrdinal"] + ")"
							awayScore = game["teams"]["away"]["score"]
							homeScore = game["teams"]["home"]["score"]
							if game["status"]["detailedState"] == "Final":
								if period == "(3rd)":
									period = ""
								yield from message.channel.send("Final: %s %s %s, %s %s %s %s" % (ParseFeeds.emojis[away], away, awayScore, ParseFeeds.emojis[home], home, homeScore, period))
							else:
								timeleft = game["linescore"]["currentPeriodTimeRemaining"]
								period = period[:-1] + " " + timeleft + period[-1]
								yield from message.channel.send("Current score: %s %s %s, %s %s %s %s" % (ParseFeeds.emojis[away], away, awayScore, ParseFeeds.emojis[home], home, homeScore, period))

						found = True
						break

				if not found:
					yield from message.channel.send("I do not think " + ParseFeeds.emojis[team] + " " + team + " plays tonight.")
			else:
				yield from message.channel.send("I do not recognize the team '" + team + "'")

######################### Meme Responses ####################################
	if message.content.startswith("!fifi") and message.guild.id == OTH_SERVER_ID:
		yield from message.channel.send("Aw yeah buddy we need way more Kevin “Fifi” Fiala up in this thread, all that animal does is rip shelfies buddy, " + \
						"pops bottles pops pussies so keep your finger on that lamp light limpdick cause the forecast is goals. Fuck your cookie jar and your water bottles, " + \
						"you better get quality rubbermaids bud cause she's gonna spend a lot of time hitting the fucking ice if Fifi has anything to say about it. " + \
						"Blistering Wristers or fat clappers, this fuckin guy can't be stopped. If I had a choice of one attack to use to kill Hitler I would choose a " + \
						"Kevin Fiala snipe from the top of the circle because you fucking know his evil dome would be bouncing off the end boards after that puck is loosed " + \
						"like lightning from the blade of God's own CCM. I'd just pick up the phone and call Kevin Fiala at 1-800-TOP-TITS where he can be found earning his " + \
						"living at the back of the goddamn net. The world record for a recorded sniper kill is 3,540m, but that's only because nobody has asked ya boi Fifi to " + \
						"rip any wristers at ISIS yet. If i had three wishes, the first would be to live forever, the second would be for Kevin Fiala to live forever, " + \
						"and the third would be for a trillion dollars so I could pay to watch ol Fifi Score top cheddar magic for all eternity.")

	if message.content.startswith("!laine") and message.guild.id == OTH_SERVER_ID:
		yield from message.channel.send("Yeah, fuck off buddy we absolutely need more Laine clips. Fuckin every time this kid steps on the ice someone scores. " + \
						"kids fuckin dirt nasty man. Does fuckin ovi have 14 goals this season I dont fuckin think so bud. I'm fuckin tellin ya Patrik 'golden flow' " + \
						"Laine is pottin 50 in '17 fuckin callin it right now. Clap bombs, fuck moms, wheel, snipe, and fuckin celly boys fuck")

	if message.content.startswith("!xfactor") and message.guild.id == OTH_SERVER_ID:
		yield from message.channel.send("I have studied tapes of him and I must disagree. While he is highly skilled, he does not have 'it' if you know what I mean. " + \
						"That 'x-factor'. The ;above and beyond; trait.")

	if message.content.startswith("!petey") and message.guild.id == OTH_SERVER_ID:
		yield from message.channel.send("Kid might look like if Malfoy was a Hufflepuff but he plays like if Potter was a Slytherin the kids absolutely fucking nasty. " + \
						"If there was a fourth unforgiveable curse it would be called petterssaucious or some shit because this kids dishes are absolutely team killing, " + \
						"SHL, AHL, NHL it doesn't fucking matter 100 points to Pettersson because he's winning the House Cup, The Calder Cup, " + \
						"The Stanley Cup and whatever fucking cup is in Sweden. Game Over.")

#################### OTH-specific responses #######################################
	if message.author.id == 144483356531228672 and ("Wes" in message.content or "wes" in message.content) and message.guild.id == OTH_SERVER_ID:
		yield from message.channel.send("@Minnesnota watch your mouth. Just cuz you tell me to do something doesn't " + \
						"mean I'm going to do it. Being a keyboard tough guy making smart ass remarks doesn't " + \
						"make you funny or clever, just a coward hiding behind a computer")

	# Trades response
	if message.content.startswith("!trades") and message.channel.id in [OTH_TECH_CHANNEL_ID, TRADEREVIEW_CHANNEL_ID]:
		bot_channel = None
		for channel in client.get_all_channels():
			if channel.id == TRADEREVIEW_CHANNEL_ID:
				bot_channel = channel

		announcements = CheckTrades.checkFleaflickerTrades()
		if len(announcements) == 0:
			yield from bot_channel.send("No pending trades to review.")
		else:
			for mystr in announcements:
				mystr = "<@&235926008266620929>\n" + mystr
				yield from bot_channel.send(mystr)

	# Inactives response
	if message.content.startswith("!inactives") and message.channel.id in [OTH_TECH_CHANNEL_ID, MODS_CHANNEL_ID]:
		bot_channel = None
		for channel in client.get_all_channels():
			if channel.id == MODS_CHANNEL_ID:
				bot_channel = channel

		CheckInactives.checkAllLeagues(True) # force
		if len(CheckInactives.inactives) == 0 and len(CheckInactives.unclaimed) == 0:
			yield from bot_channel.send("No inactive or unclaimed teams in any league currently!")
		else:
			body = ""
			for league in CheckInactives.unclaimed:
				body += str(CheckInactives.unclaimed[league]) + " unclaimed team(s) in " + league + "\n"

			if body != "":
				body += "\n"
			else:
				body += "No unclaimed teams.\n\n"

			count = 0
			for league in CheckInactives.inactives:
				body += str(len(CheckInactives.inactives[league])) + " inactive(s) in " + league + "\n"
				count += len(CheckInactives.inactives[league])
				for user in CheckInactives.inactives[league]:
					body += "\t" + user + "\n"
				body += "\n"
			if count == 0:
				body += "No inactive teams.\n"

			yield from bot_channel.send(body)

	# Fantasy matchup check response
	if message.content.startswith("!matchup") and message.guild.id == OTH_SERVER_ID:
		if len(message.content.split(" ")) == 1:
			yield from message.channel.send("Usage: !matchup <fleaflicker username>")
		else:
			# might be slow if opening too many DB connections
			db = MySQLdb.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
			cursor = db.cursor()
			team = message.content.split(" ")[1].lower()
			cursor.execute("SELECT me_u.FFname, me.currentWeekPF, opp_u.FFname, opp.currentWeekPF, me.leagueID, me.matchupID, me.wins, me.losses, opp.wins, opp.losses " + \
				       "FROM Teams AS me " + \
				       "INNER JOIN Teams AS opp ON me.CurrOpp=opp.teamID " + \
				       "INNER JOIN Users AS me_u ON me.ownerID=me_u.FFid " + \
				       "INNER JOIN Users AS opp_u ON opp.ownerID=opp_u.FFid " + \
				       "INNER JOIN Leagues AS l ON me.leagueID=l.id " + \
				       "WHERE LOWER(me_u.FFname)='" + team + "' and l.year=%d" % year)

			results = cursor.fetchall()
			if len(results) == 0:
				yield from message.channel.send("User " + team + " not found.");
			else:
				yield from message.channel.send("%s (%d-%d): **%0.2f**\n%s (%d-%d): **%0.2f**\n<https://www.fleaflicker.com/nhl/leagues/%d/scores/%d>" % (results[0][0], results[0][6], results[0][7], results[0][1], results[0][2], results[0][8], results[0][9], results[0][3], results[0][4], results[0][5]))

			cursor.close()
			db.close()

	# Woppa cup check response
#
#	I think this will be a lot easier once the Challonge API v2 is out. That should allow me to just
#	make calls instead of having to scrape the page.
#
#	if message.content.startswith("!woppacup") and message.guild.id == OTH_SERVER_ID:
#		if len(message.content.split(" ")) == 1:
#			yield from message.channel.send("Usage: !woppacup <fleaflicker username>")
#		else:
#			myteam = message.content.split(" ")[1]

			# might need selenium or scrapy for delay load
#			url = "http://challonge.com/woppacup%d" % (year+1)
#			req = urllib.request.Request(url, headers={"User-Agent" : "Magic Browser"})
#			response = urllib.request.urlopen(req)
#			page = response.read()
#			root = html.document_fromstring(page)

#			if root.cssselect("li.active")[0].text_content() == "Final Stage":
#				matches = root.cssselect(".match.-open")
#				yield from message.channel.send("%d" % (len(matches)))
#				for match in matches:
#					team1 = match.cssselect(".match--player-name")[0].text_content().split(".")[-1]
#					team2 = match.cssselect(".match--player-name")[1].text_content().split(".")[-1]
#					yield from message.channel.send("%s %s" % (team1, team2))
#
#			yield from message.channel.send("DONE")

################# Minigame responses ###########################
	# For debugging purposes
#	if message.content.startswith("!processot") and message.channel.id == OTH_TECH_CHANNEL_ID:
#		yield from ProcessOTGuesses()

	# OT contest check response
	if message.content.startswith("!ot") and message.channel.id in [OTH_TECH_CHANNEL_ID, HOCKEY_GENERAL_CHANNEL_ID]: # Add KK channel
		try:
			tokens = message.content.split(" ")
			if len(tokens) == 1:
				raise Exception("Wrong number of arguments:\n\t!ot <team> <player lastname/number>\n\t!ot standings")
			if tokens[1] == "standings":
				yield from PrintOTStandings(message.guild.id, message.channel)
				return
			if len(tokens) != 3:
				raise Exception("Wrong number of arguments:\n\t!ot <team> <player lastname/number>\n\t!ot standings")
			guess_team = tokens[1].upper()
			if guess_team.lower() not in team_map:
				raise Exception("Team not recognized:\n\t!ot <team> <player lastname/number>\n\t!ot standings")

			guess_player = tokens[2]

			date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
			root = ParseFeeds.getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
			if len(root["dates"]) <= 0:
				raise Exception("No games found for today.")

			# validate that the selected team is playing
			games = root["dates"][0]["games"]
			teamFound = False
			for game in games:
				game = ParseFeeds.getFeed("https://statsapi.web.nhl.com" + game["link"])
				if game["gameData"]["teams"]["away"]["triCode"] == guess_team or game["gameData"]["teams"]["home"]["triCode"] == guess_team:
					teamFound = True
					break

			if not teamFound:
				raise Exception("Team " + guess_team + " not found in today's games.")

			# validate that the selected team is in an in-progress game
			if "In Progress" not in game["gameData"]["status"]["detailedState"]:
				raise Exception(guess_team + " game is not currently in progress.")

			# validate that the game <2min left in the 3rd and is tied
			if game["liveData"]["linescore"]["teams"]["home"]["goals"] != game["liveData"]["linescore"]["teams"]["away"]["goals"]:
				raise Exception(guess_team + " is not in the final 2 minutes of a tied game.")

			mins_remaining = game["liveData"]["linescore"]["currentPeriodTimeRemaining"].split(":")[0]
			if mins_remaining == "END":
				mins_remaining = 0
			mins_remaining = int(mins_remaining)
			if game["liveData"]["linescore"]["currentPeriod"] != 3 or mins_remaining >= 2:
				raise Exception(guess_team + " is not in the final 2 minutes of a tied game.")

			# validate that the selected team has a player of the selected number
			playerFound = False
			for pid in game["gameData"]["players"].keys():
				player = game["gameData"]["players"][pid]
				if (player["lastName"].lower() == guess_player.lower() or str(player["primaryNumber"]) == guess_player) and player["currentTeam"]["triCode"] == guess_team:
					playerFound = True
					break

			if not playerFound:
				raise Exception(guess_team + " does not have player " + guess_player + ".")

			# store the user, server, the gameid, and the player they chose, overwriting previous choices if applicable
			try:
				with open("ot.pickle", "rb+") as f:
					try:
						pickled = pickle.load(f)
					except EOFError:
						pickled = {}

					gameid = game["gamePk"]
					guild = message.guild.id
					author = message.author.id

					pickled[(gameid, guild, author)] = (guess_team, player["id"])

					f.seek(0)
					f.truncate()
					pickle.dump(pickled, f)
			except Exception as e:
				raise Exception("Issue storing guess in local file. " + str(e))

			confirmation = message.author.name + " selects " + player["fullName"] + " for the OT GWG."
			print(confirmation)
			raise Exception(confirmation)

		except Exception as e:
			yield from message.channel.send(e)

if __name__ == "__main__":
	if len(sys.argv) > 1:
		if sys.argv[1] == "test":
			client.run(Config.config["discord_token_beta"])
	else:
		client.run(Config.config["discord_token"])
