import praw
import Config

r = praw.Reddit(client_id=Config.config["reddit_client_id"], client_secret=Config.config["reddit_secret"], username=Config.config["reddit_username"], password=Config.config["reddit_password"], user_agent="/r/oldtimehockey stats bot by /u/SPRX97 v1.0")

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()

pf = open(Config.config["srcroot"] + "scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt", "r")
r.submit("OldTimeHockey", str(year) + " Week " + str(week) + " PF Rankings", text=pf.read())

weekly = open(Config.config["srcroot"] + "scripts/weeks/" + str(year) + "_Week_" + str(week) + ".txt", "r")
r.submit("OldTimeHockey", str(year) + " Week " + str(week) + " Stats and Analysis", text=weekly.read())
