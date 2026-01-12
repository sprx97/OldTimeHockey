# Standard Python libraries
import os
import pymysql
import sys

# My libraries
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())

f.close()
if os.path.isfile(Config.config["srcroot"] + "scripts/RedditBot/weeks/" + str(year) + "_Week_" + str(week) + ".txt"):
        raise Exception("Stats file for " + str(year) + " week " + str(week) + " already exists.")

sys.stdout = open(Config.config["srcroot"] + "scripts/RedditBot/weeks/" + str(year) + "_Week_" + str(week) + ".txt", "w")

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor(pymysql.cursors.DictCursor)

s = "###OVERALL POINTS LEADERS - Who has scored the most points this season?\n"
s += "**League**|**Team**|**User**|**PF**\n"
s += ":-:|:-:|:-:|:--\n"

cursor.execute("SELECT L.name as league_name, T.name as team_name, T.pointsFor, U.FFname FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID AND L.year = T.year) " + \
               "INNER JOIN Users U on T.ownerID = U.FFid WHERE L.year=" + str(year) + " ORDER BY T.pointsFor DESC LIMIT 10")
teams = cursor.fetchall()
for team in teams:
        s += team["league_name"] + "|" + team["team_name"] + "|" + team["FFname"] + "|" + str(team["pointsFor"]) + "\n"
s += "-----\n"

s += "###LEAGUE LEADERS - Who's in first place?\n"
s += "**League**|**Team**|**User**|**Record**|**Games Ahead**\n"
s += ":-:|:-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.id, L.name as league_name, T.name as team_name, U.FFname, T.wins FROM Leagues L INNER JOIN (SELECT leagueID, MAX(wins) wins, year " + \
               "FROM Teams GROUP BY leagueID, year) tmp ON (L.id = tmp.leagueID AND L.year = tmp.year) " + \
               "INNER JOIN Teams T ON tmp.wins = T.wins AND (tmp.leagueID = T.leagueID AND tmp.year = T.year) INNER JOIN Users U ON T.ownerID = U.FFid " + \
               "WHERE L.year=" + str(year) + " ORDER BY T.wins DESC, L.name DESC")

teams = cursor.fetchall()
for team in teams:
        cursor.execute("SELECT T.wins FROM Teams T WHERE T.leagueID = " + str(team["id"]) + " AND T.year = " + str(year) + " ORDER BY T.wins DESC LIMIT 1 OFFSET 1")
        second = cursor.fetchall()[0]["wins"]
        s += team["league_name"] + "|" + team["team_name"] + "|" + team["FFname"] + "|" + str(team["wins"]) + "|" + str(team["wins"]-second) + "\n"
s += "-----\n"

s += "###LONGEST WIN/LOSS STREAKS (regular season) - Who's hot and who's not?\n"
s += "**League**|**Owner**|**Streak**|**Record**\n"
s += ":-:|:-:|:-:|:-:\n"

cursor.execute("SELECT T.ownerID, L.name, U.FFname, T.streak, T.wins, T.losses FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID and L.year = T.year) INNER JOIN Users U ON T.ownerID = U.FFid " + \
               "WHERE (L.year=" + str(year) + " AND T.replacement = 0) ORDER BY T.streak DESC")

teams = cursor.fetchall()
# adjust to add in previous years streaks
teamslist = []
for team in teams:
        if team["wins"] == 0 or team["losses"] == 0: # streak extends to previous years
                tmpyear = year-1
                while 1:
                        cursor.execute("SELECT T.streak, T.wins, T.losses FROM Teams T INNER JOIN Leagues L ON (T.leagueID=L.id AND T.year=L.year) WHERE T.ownerID = " + str(team["ownerID"]) + " AND T.replacement != 1 AND L.year = " + str(tmpyear))
                        prev = cursor.fetchall()
                        if len(prev) == 0 or len(prev) > 1:
                                break
                        prev = prev[0]
                        if prev["streak"]*team["streak"] > 0: # streaks are same direction
                                team["streak"] += prev["streak"]
                        if (prev["streak"] > 0 and prev["streak"] == prev["wins"]) or (prev["streak"] < 0 and prev["streak"] == prev["losses"]):
                                tmpyear -= 1
                                continue
                        break
        teamslist.append(team)
teams = teamslist

teams = sorted(teams, key=lambda x: x["streak"], reverse=True)
last = teams[0]["streak"]
count = 0
for team in teams:      
        count += 1
        if count > 5 and team["streak"] != last:
                break
        last = team["streak"]
        s += team["name"] + "|" + team["FFname"] + "|W" + str(team["streak"]) + "|" + str(team["wins"]) + "-" + str(team["losses"]) + "\n"
s += "-----\n\n"

s += "**League**|**Owner**|**Streak**|**Record**\n"
s += ":-:|:-:|:-:|:-:\n"
teams = teams[::-1]
last = teams[0]["streak"]
count = 0
for team in teams:
        count += 1
        if count > 5 and team["streak"] != last:
                break
        last = team["streak"]
        s += team["name"] + "|" + team["FFname"] + "|L" + str(abs(team["streak"])) + "|" + str(team["wins"]) + "-" + str(team["losses"]) + "\n"
s += "-----\n"

s += "###WEEKLY LEAGUE LEADERS - Who scored the most points this week?\n"
s += "**League**|**Team**|**Owner**|**Weekly Points**|**Weekly Rank**\n"
s += ":-:|:-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.name as league_name, T.name as team_name, U.FFname, T.currentWeekPF FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID AND L.year = T.year) INNER JOIN Users U ON T.ownerID = U.FFid " + \
               "WHERE L.year=" + str(year) + " ORDER BY T.currentWeekPF DESC LIMIT 10")

teams = cursor.fetchall()
count = 0
for team in teams:
        count += 1
        s += team["league_name"] + "|" + team["team_name"] + "|" + team["FFname"] + "|" + str(team["currentWeekPF"]) + "|" + str(count) + "\n" 
s += "-----\n"

s += "###DIVISION WEEKLY POINT LEADERS - Who scored  the most points in each division?\n"
s += "**League**|**Team**|**Owner**|**Weekly Points**|**Weekly Rank**\n"
s += ":-:|:-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.name as league_name, T.name as team_name, U.FFname, T.currentWeekPF FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID AND L.year=T.year) INNER JOIN Users U ON T.ownerID = U.FFid " + \
               "INNER JOIN (SELECT leagueID, MAX(currentWeekPF) AS leader FROM Teams GROUP BY leagueID, year) maxpf ON T.currentWeekPF = maxpf.leader " + \
               "WHERE L.year=" + str(year) + " and maxpf.leader != 0.0 ORDER BY T.currentWeekPF DESC")

teams = cursor.fetchall()
for team in teams:
        cursor.execute("SELECT COUNT(*) FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID and L.year = T.year) WHERE L.year=" + str(year) + " AND T.currentWeekPF > " + str(team[3]-.001))
        rank = cursor.fetchall()[0]["league_name"]
        s += team["league_name"] + "|" + team["team_name"] + "|" + team["FFname"] + "|" + str(team["currentWeekPF"]) + "|" + str(rank) + "\n"
s += "-----\n"

s += "###WEEKLY WALL-OF-SHAME - Who scored the fewest points this week?\n"
s += "**League**|**Team**|**Owner**|**Weekly Points**\n"
s += ":-:|:-:|:-:|:-:\n"

cursor.execute("SELECT L.name as league_name, T.name as team_name, U.FFname, T.currentWeekPF FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID and L.year = T.year) INNER JOIN Users U ON T.ownerID = U.FFid " + \
               "WHERE L.year=" + str(year) + " ORDER BY T.currentWeekPF ASC")

teams = cursor.fetchall()
last = teams[0]["currentWeekPF"]
count = 0
for team in teams:
        count += 1
        if count > 3 and team["currentWeekPF"] != last:
                break
        last = team["currentWeekPF"]
        s += team["league_name"] + "|" + team["team_name"] + "|" + team["FFname"] + "|" + str(team["currentWeekPF"]) + "\n"
s += "-----\n"

s += "###WEEKLY LEAGUE AVERAGES - What did each league average this week?\n"
s += "**LEAGUE**|**WEEKLY AVERAGE**\n"
s += ":-:|:-:\n"

cursor.execute("SELECT L.name, ROUND(AVG(T.currentWeekPF), 2) AS leagueavg FROM Leagues L INNER JOIN Teams T ON (L.id = T.leagueID and L.year = T.year) " + \
               "WHERE L.year=" + str(year) + " GROUP BY L.id ORDER BY leagueavg DESC")
leagues = cursor.fetchall()
for league in leagues:
        s += league["name"] + "|" + str(league["leagueavg"]) + "\n"
s += "-----\n"

s += "###BIGGEST BLOWOUT - Who forgot to bring their 'A' game?\n"

cursor.execute("SELECT L.name as league_name, T1.name as team_name, T2.name as opp_name, T1.currentWeekPF as PF, T2.currentWeekPF as opp_PF, ROUND(T1.currentWeekPF-T2.currentWeekPF, 2) AS diff FROM Leagues L " + \
               "INNER JOIN Teams T1 ON (L.id = T1.leagueID and L.year = T1.year) INNER JOIN Teams T2 ON (T1.currOpp = T2.teamID and T1.year = T2.year) " + \
               "WHERE L.year=" + str(year) + " AND (T1.currentWeekPF > T2.currentWeekPF) ORDER BY diff DESC")

teams = cursor.fetchall()

if len(teams) != 0:
        team = teams[0]
        s += "**" + team["team_name"] + "**|**" + team["opp_name"] + "**\n"
        s += ":-:|:-:\n"
        s += str(team["PF"]) + "|" + str(team["opp_PF"]) + "\n"
        s += "Difference:|" + str(team["diff"]) + "\n"
        s += "League:|" + team["league_name"] + "\n"
        s += "-----\n"

        s += "###CLOSEST MATCH - Who's really thankful for that extra shot and hit and who suffered a tough loss?\n"
        team = teams[-1]
        s += "**" + team["team_name"] + "**|**" + team["opp_name"] + "**\n"
        s += ":-:|:-:\n"
        s += str(team["PF"]) + "|" + str(team["opp_PF"]) + "\n"
        s += "Difference:|" + str(team["diff"]) + "\n"
        s += "League:|" + team["league_name"] + "\n"
        s += "-----\n"

print(s)
