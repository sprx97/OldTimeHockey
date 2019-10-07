import praw
import Config

r = praw.Reddit("/r/oldtimehockey stats bot by /u/SPRX97 v1.0")
r.login(Config.config["reddit_username"], Config.config["reddit_password"], disable_warning=True)
disclaimer = "I am a bot written and maintained by /u/SPRX97. Message him with any comments, suggestions, or complaints."

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()

pf = open(Config.config["srcroot"] + "scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt", "r")
r.submit("OldTimeHockey", str(year) + " Week " + str(week) + " PF Rankings", text=pf.read())

weekly = open(Config.config["srcroot"] + "scripts/weeks/" + str(year) + "_Week_" + str(week) + ".txt", "r")
r.submit("OldTimeHockey", str(year) + " Week " + str(week) + " Stats and Analysis", text=weekly.read())
