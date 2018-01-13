import json
import MySQLdb

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()

db = MySQLdb.connect(host="localhost", user="root", db="OldTimeHockey")
cursor = db.cursor()

cursor.execute("select Teams.name, Leagues.name from Teams inner join Leagues on leagueID=id where year=" + str(year) + " order by pointsFor desc")

f = open("/var/www/roldtimehockey/scripts/seeds.txt", "w")
ranks = cursor.fetchall()
for n in range(len(ranks)):
	f.write(str(n+1) + ". " + ranks[n][0] + "\t" + ranks[n][1] +  "\n")

f.close()
