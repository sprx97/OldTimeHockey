import os
import pymysql
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Config

# TODO: This needs to handle name changes

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
f.close()

DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
cursor = DB.cursor()

d1 = []
d2 = []
d3 = []
d4 = []
d5 = []
d1_fill = []
d2_fill = []
d3_fill = []
d4_fill = []
tenure = []

# D1 Assignments
def GenerateD1List():
    # Ask for WoppaCup champ
#    wc_champ = input("Who won the woppa cup? ").lower()
    wc_champ = "tooproforyou"
    d1.append([wc_champ, "WC Champ"])

    # Get PF Champion via query
    query = f"SELECT U.FFname from Teams as T INNER JOIN Users as U ON (T.ownerID=U.FFid) WHERE T.year={year} ORDER BY T.pointsFor DESC LIMIT 1"
    cursor.execute(query)
    pf_champ = cursor.fetchall()[0]
    d1.append([pf_champ["FFname"].lower(), "PF Champ"])

    # Get the 6 D1 playoff teams via query
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=1 " + \
            f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 6"
    cursor.execute(query)
    d1_playoff_teams = cursor.fetchall()
    for team in d1_playoff_teams:
        d1.append([team["FFname"], "D1 Playoffs"])

    # Get the 6 D2 finalists via query
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=2 AND ((P.wins >= 2 AND P.seed >= 3) OR (P.wins >= 1 AND P.seed < 3))"
    cursor.execute(query)
    d2_finalists = cursor.fetchall()
    for team in d2_finalists:
        d1.append([team["FFname"], "D2 Finalist"])

# D2 Assignments
def GenerateD2List():
    # Ask for WC Runner Up
#    wc_runnerup = input("Who was the woppa cup runner up? ").lower()
    wc_runnerup = "ch1zzle"
    d2.append([wc_runnerup, "WC Runnerup"])

    # Get D1 ranks 7-12
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=1 " + \
            f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 6 OFFSET 6"
    cursor.execute(query)
    d1_middle = cursor.fetchall()
    for team in d1_middle:
        d2.append([team["FFname"], "D1 7-12"])

    # Get D2 semifinalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=2 AND ((P.wins >= 1 AND P.seed >= 3) OR (P.wins >= 0 AND P.seed < 3))"
    cursor.execute(query)
    d2_playoff_teams = cursor.fetchall()
    for team in d2_playoff_teams:
        d2.append([team["FFname"], "D2 Semifinalist"])

    # Get D3 finalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=3 AND ((P.wins >= 2 AND P.seed >= 3) OR (P.wins >= 1 AND P.seed < 3))"
    cursor.execute(query)
    d3_semifinalists = cursor.fetchall()
    for team in d3_semifinalists:
        d2.append([team["FFname"], "D3 Finalist"])

    # Get six highest-PF D2 teams remaining
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=2 ORDER BY pointsFor DESC"
    cursor.execute(query)
    d2_PF = cursor.fetchall()
    found = 0
    for team in d2_PF:
        name = team["FFname"]
        if name not in d2:
            d2.append([name, "D2 next-6 PF"])
            found += 1

        if found == 6:
            break

    # Get two highest-PF D3 teams remaining
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=3 ORDER BY pointsFor DESC"
    cursor.execute(query)
    d3_PF = cursor.fetchall()
    found = 0
    for team in d3_PF:
        name = team["FFname"]
        if name not in d2:
            d2.append([name, "D3 next-2 PF"])
            found += 1

        if found == 2:
            break

# D3 Assignments
def GenerateD3List():
    # Get D1 ranks 13 and 14
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=1 " + \
            f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 2 OFFSET 12"
    cursor.execute(query)
    d1_bottom = cursor.fetchall()
    for team in d1_bottom:
        d3.append([team["FFname"], "D1 13-14"])

    # Get D2 QF losers
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=2 AND (P.wins = 0 AND P.seed >= 3)"
    cursor.execute(query)
    d2_playoff_teams = cursor.fetchall()
    for team in d2_playoff_teams:
        d3.append([team["FFname"], "D2 5-6"])

    # Get D2 7-12
    for league in [12087, 12088, 12089]:
        query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
                f"WHERE T.year={year} AND L.id={league} " + \
                f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 6 OFFSET 6"        
        cursor.execute(query)
        d2_nonplayoff = cursor.fetchall()
        for team in d2_nonplayoff:
            d3.append([team["FFname"], "D2 7-12"])

    # Get D3 Semifinalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=3 AND ((P.wins = 1 AND P.seed >= 3) OR (P.wins = 0 AND P.seed < 3))"
    cursor.execute(query)
    d2_playoff_teams = cursor.fetchall()
    for team in d2_playoff_teams:
        d3.append([team["FFname"], "D3 Semifinalist"])

    # Get D4 finalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=4 AND ((P.wins >= 2 AND P.seed >= 3) OR (P.wins >= 1 and P.seed < 3))"
    cursor.execute(query)
    d4_semifinalists = cursor.fetchall()
    for team in d4_semifinalists:
        d3.append([team["FFname"], "D4 Finalist"])

def GenerateD4List():
    # Get D2 ranks 13 and 14
    for league in [12087, 12088, 12089]:
        query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
                f"WHERE T.year={year} AND L.id={league} " + \
                f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 2 OFFSET 12"
        cursor.execute(query)
        d2_bottom = cursor.fetchall()
        for team in d2_bottom:
            d4.append([team["FFname"], "D2 13-14"])

    # Get D3 QF losers
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=3 AND (P.wins = 0 AND P.seed >= 3)"
    cursor.execute(query)
    d3_qf_losers = cursor.fetchall()
    for team in d3_qf_losers:
        d4.append([team["FFname"], "D3 5-6"])

    # Get D3 non-playoff teams
    query = f"SELECT U.FFname from Teams as T LEFT JOIN Teams_post P ON (T.teamID=P.teamID AND T.year=P.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) " + \
            f"INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.teamID IS NULL AND T.year={year} AND L.tier=3"
    cursor.execute(query)
    d3_nonplayoff = cursor.fetchall()
    for team in d3_nonplayoff:
        d4.append([team["FFname"], "D3 7-14"])

    # Get D4 Semifinalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=4 AND ((P.wins = 1 AND P.seed >= 3) OR (P.wins = 0 AND P.seed < 3))"
    cursor.execute(query)
    d4_semifinalists = cursor.fetchall()
    for team in d4_semifinalists:
        d4.append([team["FFname"], "D4 Semifinalist"])

def GenerateD5List():
    # Get all players from last year
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) WHERE T.year={year}"
    cursor.execute(query)
    all_teams = cursor.fetchall()
    for team in all_teams:
        d5.append([team["FFname"], "D4 5-14"])

# Generate Fill lists for each div
# Order matters in these
def GenerateD1FillOrder():
    # Get PF ranks of just D1 and D2 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND (L.tier=1 OR L.tier=2) ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        d1_fill.append(team["FFname"])

def GenerateD2FillOrder():
    # Get PF ranks of just D1-D3 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND (L.tier=1 OR L.tier=2 OR L.tier=3) ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        d2_fill.append(team["FFname"])

# TODO: Adjust Chelios PF for D3 fill
def GenerateD3FillOrder():
    # Get PF ranks of just D1-D4 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        d3_fill.append(team["FFname"])

# Generate Tenure list
TENURE_NUM_YEARS = 5 # Currently back to 16-17. Needs to be adjusted.
def GenerateTenureList():
    # Get all the D1 members from the past TENURE_NUM_YEARS years
    query = f"SELECT DISTINCT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year>{year-TENURE_NUM_YEARS} AND L.tier=1"
    cursor.execute(query)
    d1_teams = cursor.fetchall()
    for team in d1_teams:
        tenure.append(team["FFname"].lower())

    # Get all the D2 playoff teams from the past TENURE_NUM_YEARS years
    query = f"SELECT DISTINCT U.FFname from Teams as T INNER JOIN Teams_post as P ON (T.teamID=P.teamID AND T.year=P.year) " + \
            f"INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year>{year-TENURE_NUM_YEARS} AND L.tier=2"
    cursor.execute(query)
    d2_playoff_teams = cursor.fetchall()
    for team in d2_playoff_teams:
        tenure.append(team["FFname"].lower())

def EliminateDupes(data, seen=[]):
    result = []
    for item in data:
        if item[0] not in seen:
            seen.append(item[0])
            result.append(item)
    return result

GenerateD1List()
d1 = EliminateDupes(d1)
GenerateD1FillOrder()
d1_fill = [i for i in d1_fill if i not in {t[0] for t in d1}]

print("---- D1 ----")
for manager in d1:
    print(manager[0])
#    print(manager[1], manager[0])
print(f"---- D1 Fill ({14-len(d1)}) ----")
for manager in d1_fill:
    print(manager)

GenerateD2List()
d2 = EliminateDupes(d2)
d2 = EliminateDupes(d2, d1)
GenerateD2FillOrder()
d2_fill = [i for i in d2_fill if i not in {t[0] for t in d1} and i not in {t[0] for t in d2}]

print("\n---- D2 ----")
for manager in d2:
    print(manager[0])
#    print(manager[1], manager[0])
print(f"---- D2 Fill ({28-len(d2)}) ----")
for manager in d2_fill:
    print(manager)

GenerateD3List()
d3 = EliminateDupes(d3)
d3 = EliminateDupes(d3, d2)
d3 = EliminateDupes(d3, d1)
GenerateD3FillOrder()
d3_fill = [i for i in d3_fill if i not in {t[0] for t in d1} and i not in {t[0] for t in d2} and i not in {t[0] for t in d3}]

print("\n---- D3 ----")
for manager in d3:
    print(manager[0])
#    print(manager[1], manager[0])
print(f"---- D3 Fill ({42-len(d3)}) ----")
for manager in d3_fill:
    print(manager)

GenerateD4List()
d4 = EliminateDupes(d4)
d4 = EliminateDupes(d4, d3)
d4 = EliminateDupes(d4, d2)
d4 = EliminateDupes(d4, d1)
d4_fill = [i for i in d3_fill if i not in {t[0] for t in d1} and i not in {t[0] for t in d2} and i not in {t[0] for t in d3} and i not in {t[0] for t in d4}]
# D4 Fill list is the same as the D3 fill list

print("\n---- D4 ----")
for manager in d4:
    print(manager[0])
#    print(manager[1], manager[0])
print(f"---- D4 Fill ({56-len(d4)}) ----")
for manager in d4_fill:
    print(manager)

# GenerateD5List()

# print("\n---- D5 ----")
# for manager in d5:
#     print(manager)

# Tenured managers get fast tracked to D4 this year if necessary
# GenerateTenureList()
# tenure = list(set(tenure)) # Remove duplicates
# tenure.sort()
