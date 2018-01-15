import MySQLdb
import sys
import os.path

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()
if os.path.isfile("/var/www/roldtimehockey/scripts/weeks/" + str(year) + "_Week_" + str(week) + ".txt"):
	raise Exception("Stats file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open("/var/www/roldtimehockey/scripts/weeks/" + str(year) + "_Week_" + str(week) + ".txt", "w")

db = MySQLdb.connect(host="localhost", user="othuser", passwd="othpassword", db="OldTimeHockey")
cursor = db.cursor()

s = "###OVERALL POINTS LEADERS - Who has scored the most points this season?\n"
s += "**League**|**Team**|**User**|**PF**\n"
s += ":-:|:-:|:-:|:--\n"

cursor.execute("SELECT L.name, T.name, T.pointsFor, U.FFname FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID " + \
	       "INNER JOIN Users U on T.ownerID = U.FFid WHERE L.year=" + str(year) + " ORDER BY T.pointsFor DESC LIMIT 10")
teams = cursor.fetchall()
for team in teams:
	s += team[0] + "|" + team[1] + "|" + team[3] + "|" + str(team[2]) + "\n"
s += "-----\n"

s += "###LEAGUE LEADERS - Who's in first place?\n"
s += "**League**|**Team**|**User**|**Record**|**Games Ahead**\n"
s += ":-:|:-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.id, L.name, T.name, U.FFname, T.wins FROM Leagues L INNER JOIN (SELECT leagueID, MAX(wins) wins FROM Teams GROUP BY leagueID) tmp ON L.id = tmp.leagueID " + \
	       "INNER JOIN Teams T ON tmp.wins = T.wins AND tmp.leagueID = T.leagueID INNER JOIN Users U ON T.ownerID = U.FFid " + \
	       "WHERE L.year=" + str(year) + " ORDER BY T.wins DESC, L.name DESC")

teams = cursor.fetchall()
for team in teams:
	cursor.execute("SELECT T.wins FROM Teams T WHERE T.leagueID = " + str(team[0]) + " ORDER BY T.wins DESC LIMIT 1 OFFSET 1")
	second = cursor.fetchall()[0][0]
	s += team[1] + "|" + team[2] + "|" + team[3] + "|" + str(team[4]) + "|" + str(team[4]-second) + "\n"
s += "-----\n"

s += "###LONGEST WIN/LOSS STREAKS (regular season) - Who's hot and who's not?\n"
s += "**League**|**Owner**|**Streak**|**Record**\n"
s += ":-:|:-:|:-:|:-:\n"

cursor.execute("SELECT T.ownerID, L.name, U.FFname, T.streak, T.wins, T.losses FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID INNER JOIN Users U ON T.ownerID = U.FFid " + \
	       "WHERE (L.year=" + str(year) + " AND T.replacement = 0) ORDER BY T.streak DESC")

teams = cursor.fetchall()
# adjust to add in previous years streaks
for team in teams:
	if teams[4] == 0 or teams[5] == 0: # streak extends to previous years
		tmpyear = year-1
		while 1:
			cursor.execute("SELECT T.streak, T.wins, T.losses FROM Teams T WHERE T.ownerID = " + str(team[0]) + " AND year = " + str(tmpyear))
			prev = cursor.fetchall()
			if len(prev) == 0:
				break
			if prev[0]*team[3] > 0: # streaks are same direction
				teams[3] += prev[0]
			if (prev[0] > 0 and prev[0] == prev[1]) or (prev[0] < 0 and prev[0] == prev[2]):
				tmpyear -= 1
				continue
			break

teams = sorted(teams, key=lambda x: x[3], reverse=True)
last = teams[0][3]
count = 0
for team in teams:	
	count += 1
	if count > 5 and team[3] != last:
		break
	last = team[3]
	s += team[1] + "|" + team[2] + "|W" + str(team[3]) + "|" + str(team[4]) + "-" + str(team[5]) + "\n"
s += "-----\n\n"

s += "**League**|**Owner**|**Streak**|**Record**\n"
s += ":-:|:-:|:-:|:-:\n"
teams = teams[::-1]
last = teams[0][3]
count = 0
for team in teams:
	count += 1
	if count > 5 and team[3] != last:
		break
	last = team[3]
	s += team[1] + "|" + team[2] + "|L" + str(abs(team[3])) + "|" + str(team[4]) + "-" + str(team[5]) + "\n"
s += "-----\n"

s += "###WEEKLY LEAGUE LEADERS - Who scored the most points this week?\n"
s += "**League**|**Team**|**Owner**|**Weekly Points**|**Weekly Rank**\n"
s += ":-:|:-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.name, T.name, U.FFname, T.currentWeekPF FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID INNER JOIN Users U ON T.ownerID = U.FFid " + \
	       "WHERE L.year=" + str(year) + " ORDER BY T.currentWeekPF DESC LIMIT 10")

teams = cursor.fetchall()
count = 0
for team in teams:
	count += 1
	s += team[0] + "|" + team[1] + "|" + team[2] + "|" + str(team[3]) + "|" + str(count) + "\n" 
s += "-----\n"

s + "###DIVISION WEEKLY POINT LEADERS - Who scored  the most points in each division?\n"
s += "**League**|**Team**|**Owner**|**Weekly Points**|**Weekly Rank**\n"
s += ":-:|:-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.name, T.name, U.FFname, T.currentWeekPF FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID INNER JOIN Users U ON T.ownerID = U.FFid " + \
	       "INNER JOIN (SELECT leagueID, MAX(currentWeekPF) AS leader FROM Teams GROUP BY leagueID) maxpf ON T.currentWeekPF = maxpf.leader " + \
	       "WHERE L.year=" + str(year) + " ORDER BY T.currentWeekPF DESC")

teams = cursor.fetchall()
for team in teams:
	cursor.execute("SELECT COUNT(*) FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID WHERE L.year=" + str(year) + " AND T.currentWeekPF > " + str(team[3]-.001))
	rank = cursor.fetchall()[0][0]
	s += team[0] + "|" + team[1] + "|" + team[2] + "|" + str(team[3]) + "|" + str(rank) + "\n"
s += "-----\n"

s += "###WEEKLY WALL-OF-SHAME - Who scored the fewest points this week?\n"
s += "**League**|**Team**|**Owner**|**Weekly Points**\n"
s += ":-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.name, T.name, U.FFname, T.currentWeekPF FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID INNER JOIN Users U ON T.ownerID = U.FFid " + \
	       "WHERE L.year=" + str(year) + " ORDER BY T.currentWeekPF ASC")

teams = cursor.fetchall()
last = teams[0][3]
count = 0
for team in teams:
	count += 1
	if count > 3 and team[3] != last:
		break
	last = team[3]
	s += team[0] + "|" + team[1] + "|" + team[2] + "|" + str(team[3]) + "\n"
s += "-----\n"

s += "###WEEKLY LEAGUE AVERAGES - What did each league average this week?\n"
s += "**LEAGUE**|**WEEKLY AVERAGE**\n"
s += ":-:|:-:\n"

cursor.execute("SELECT L.name, ROUND(AVG(T.currentWeekPF), 2) AS leagueavg FROM Leagues L INNER JOIN Teams T ON L.id = T.leagueID " + \
	       "WHERE L.year=" + str(year) + " GROUP BY L.id ORDER BY leagueavg DESC")
leagues = cursor.fetchall()
for league in leagues:
	s += league[0] + "|" + str(league[1]) + "\n"
s += "-----\n"

s += "###BIGGEST BLOWOUT - Who forgot to bring their 'A' game?\n"

cursor.execute("SELECT L.name, T1.name, T2.name, T1.currentWeekPF, T2.currentWeekPF, ROUND(T1.currentWeekPF-T2.currentWeekPF, 2) AS diff FROM Leagues L " + \
	       "INNER JOIN Teams T1 ON L.id = T1.leagueID INNER JOIN Teams T2 ON T1.currOpp = T2.teamID " + \
	       "WHERE L.year=" + str(year) + " AND (T1.currentWeekPF > T2.currentWeekPF) ORDER BY diff DESC")

teams = cursor.fetchall()
team = teams[0]
s += "**" + team[1] + "**|**" + team[2] + "**\n"
s += ":-:|:-:\n"
s += str(team[3]) + "|" + str(team[4]) + "\n"
s += "Difference:|" + str(team[5]) + "\n"
s += "League:|" + team[0] + "\n"
s += "-----\n"

s += "###CLOSEST MATCH - Who's really thankful for that extra shot and hit and who suffered a tough loss?\n"
team = teams[-1]
s += "**" + team[1] + "**|**" + team[2] + "**\n"
s += ":-:|:-:\n"
s += str(team[3]) + "|" + str(team[4]) + "\n"
s += "Difference:|" + str(team[5]) + "\n"
s += "League:|" + team[0] + "\n"
s += "-----\n"

# Generate top players for a week

print s
