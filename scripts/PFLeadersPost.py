import MySQLdb
import sys
import os.path

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()
if os.path.isfile("/var/www/roldtimehockey/scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt"):
	raise Exception("PFs file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open("/var/www/roldtimehockey/scripts/PFs/" + str(year) + "_Week_" + str(week) + ".txt", "w")

db = MySQLdb.connect(host="localhost", user="root", passwd="12345", db="OldTimeHockey")
cursor = db.cursor()
cursor.execute("SELECT L.name, T.name, T.pointsFor, U.FFname FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID " + \
	       "INNER JOIN Users U on T.ownerID = U.FFid WHERE year=" + str(year) + " ORDER BY T.pointsFor DESC")
teams = cursor.fetchall()
s = "###OVERALL POINTS LEADERS - Who has scored hte most points this season?\n"
s += "**Rank**|**League**|**Team**|**User**|**PF**\n"
s += ":-:|:-:|:-:|:-:|:--\n"

rank = 1
for team in teams:
	s += str(rank) + "|" + team[0] + "|" + team[1] + "|" + team[3] + "|" + str(team[2]) + "\n"
	rank += 1
s += "-----\n"

print s
