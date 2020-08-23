import urllib.request # url reading
from lxml import etree
from lxml import html # xml parsing
import MySQLdb
import re

import sys
sys.path.append("../")
import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())

def checkFleaflickerTrades():
	with open("posted_trades.txt") as f:
		posted = f.readlines()
	posted = [int(x.strip()) for x in posted]

	strs = []
	db = MySQLdb.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
	cursor = db.cursor()
	cursor.execute("SELECT id from Leagues where year=" + str(year))
	for league in cursor.fetchall():
		tradesURL = "http://www.fleaflicker.com/nhl/leagues/" + str(league[0]) + "/trades"
		response = urllib.request.urlopen(tradesURL)
		page = response.read()
		root = html.document_fromstring(page)

		items = root.cssselect("div.list-group-item div.text-muted.media-info a")
		for item in items:
			link = item.get("href")

			# skip trades that have already been posted in the channel
			tradeID = int(re.split("/", link)[-1].strip())
			if tradeID in posted:
				continue

			url = "https://www.fleaflicker.com" + link
			response2 = urllib.request.urlopen(url)
			page2 = response2.read()
			root2 = html.document_fromstring(page2)

			trade = root2.cssselect("div.player-inline")[0]
			team1 = trade.cssselect("div.league-name")[0]
			team2 = trade.cssselect("div.league-name")[1]

			tradestr = "**" + team1.text_content() + "**\n"
			for player in trade.cssselect("ul")[0].cssselect("div.player-name"):
				tradestr += "- " + player.text_content() + "\n"

			tradestr += "\n"

			tradestr += "**" + team2.text_content() + "**\n"
			for player in trade.cssselect("ul")[1].cssselect("div.player-name"):
				tradestr += "- " + player.text_content() + "\n"
			
			tradestr += "\n"
			tradestr += url

			strs.append(tradestr)

			with open("posted_trades.txt", "a") as f:
				f.write(str(tradeID) + "\n")
	return strs

if __name__ == "__main__":
	strs = checkFleaflickerTrades()
	for s in strs:
		print(s)
