import MySQLdb
import sys
import os.path
import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()
if os.path.isfile(Config.config["srcroot"] + "scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt"):
        raise Exception("PFs file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open(Config.config["srcroot"] + "scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt", "w")

db = MySQLdb.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()
cursor.execute("SELECT L.name, T.name, T.pointsFor, U.FFname FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID and L.year = T.year) " + \
               "INNER JOIN Users U on T.ownerID = U.FFid WHERE L.year=" + str(year) + " ORDER BY T.pointsFor DESC")
teams = cursor.fetchall()
s = "###OVERALL POINTS LEADERS - Who has scored hte most points this season?\n"
s += "**Rank**|**League**|**Team**|**User**|**PF**\n"
s += ":-:|:-:|:-:|:-:|:--\n"

rank = 1
for team in teams:
        s += str(rank) + "|" + team[0] + "|" + team[1] + "|" + team[3] + "|" + str(team[2]) + "\n"
        rank += 1
s += "-----\n"

print(s)
