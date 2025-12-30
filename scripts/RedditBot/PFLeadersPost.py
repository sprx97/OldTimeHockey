# Standard Python libraries
import os
import pymysql
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()
if os.path.isfile(Config.config["srcroot"] + "scripts/RedditBot/PFs/" + str(year) + "_Week_" + str(week) + ".txt"):
        raise Exception("PFs file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open(Config.config["srcroot"] + "scripts/RedditBot/PFs/" + str(year) + "_Week_" + str(week) + ".txt", "w")

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor(pymysql.cursors.DictCursor)
cursor.execute("SELECT L.name as league_name, T.name as team_name, T.pointsFor, U.FFname FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID and L.year = T.year) " + \
               "INNER JOIN Users U on T.ownerID = U.FFid WHERE L.year=" + str(year) + " ORDER BY T.pointsFor DESC")
teams = cursor.fetchall()
s = "###OVERALL POINTS LEADERS - Who has scored the most points this season?\n"
s += "**Rank**|**League**|**Team**|**User**|**PF**\n"
s += ":-:|:-:|:-:|:-:|:--\n"

rank = 1
for team in teams:
        s += str(rank) + "|" + team["league_name"] + "|" + team["team_name"] + "|" + team["FFname"] + "|" + str(team["pointsFor"]) + "\n"
        rank += 1
s += "-----\n"

print(s)
