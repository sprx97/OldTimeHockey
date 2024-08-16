import os
import pymysql
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
f.close()

DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
cursor = DB.cursor()

d1 = []
d2 = []
d3 = []
d4 = []
d1_fill = []
d2_fill = []
d3_fill = []
tenure = []

# D1 Assignments
def GenerateD1List():
    # Ask for WoppaCup champ
    wc_champ = input("Who won the woppa cup? ").lower()
    d1.append(wc_champ)

    # Get PF Champion via query
    query = f"SELECT U.FFname from Teams as T INNER JOIN Users as U ON (T.ownerID=U.FFid) WHERE T.year={year} ORDER BY T.pointsFor DESC LIMIT 1"
    cursor.execute(query)
    pf_champ = cursor.fetchall()[0]
    d1.append(pf_champ["FFname"].lower())

    # Get the 6 D1 playoff teams via query
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=1 " + \
            f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 6"
    cursor.execute(query)
    d1_playoff_teams = cursor.fetchall()
    for team in d1_playoff_teams:
        d1.append(team["FFname"])

    # Get the 6 D2 finalists via query
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=2 AND ((P.wins >= 2 AND P.seed >= 3) OR (P.wins >= 1 AND P.seed < 3))"
    cursor.execute(query)
    d2_finalists = cursor.fetchall()
    for team in d2_finalists:
        d1.append(team["FFname"])

# D2 Assignments
def GenerateD2List():
    # Ask for WC Runner Up
    wc_runnerup = input("Who was the woppa cup runner up? ").lower()
    d2.append(wc_runnerup)

    # Get D1 ranks 7-12
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=1 " + \
            f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 6 OFFSET 6"
    cursor.execute(query)
    d1_middle = cursor.fetchall()
    for team in d1_middle:
        d2.append(team["FFname"])

    # Get D2 playoff teams that are not finalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=2 AND ((P.wins < 2 AND P.seed >= 3) OR (P.wins < 1 AND P.seed < 3))"
    cursor.execute(query)
    d2_playoff_teams = cursor.fetchall()
    for team in d2_playoff_teams:
        d2.append(team["FFname"])

    # Get D3 semifinalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=3 AND ((P.wins >= 1 AND P.seed >= 3) OR (P.seed < 3))"
    cursor.execute(query)
    d3_semifinalists = cursor.fetchall()
    for team in d3_semifinalists:
        d2.append(team["FFname"])

    # Get three highest-PF D4 teams
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=4 ORDER BY pointsFor DESC LIMIT 3"
    cursor.execute(query)
    d3_semifinalists = cursor.fetchall()
    for team in d3_semifinalists:
        d2.append(team["FFname"])

# D3 Assignments
def GenerateD3List():
    # Get D1 ranks 13 and 14
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND L.tier=1 " + \
            f"ORDER BY T.wins DESC, T.pointsFor DESC LIMIT 2 OFFSET 12"
    cursor.execute(query)
    d1_bottom = cursor.fetchall()
    for team in d1_bottom:
        d3.append(team["FFname"])

    # Get D2 non-playoff teams
    query = f"SELECT U.FFname from Teams as T LEFT JOIN Teams_post P ON (T.teamID=P.teamID AND T.year=P.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) " + \
            f"INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.teamID IS NULL AND T.year={year} AND L.tier=2"
    cursor.execute(query)
    d2_nonplayoff = cursor.fetchall()
    for team in d2_nonplayoff:
        d3.append(team["FFname"])

    # Get D3 ranks 5-6
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=3 AND (P.wins < 1 AND P.seed >= 3)"
    cursor.execute(query)
    d3_playoff_teams = cursor.fetchall()
    for team in d3_playoff_teams:
        d3.append(team["FFname"])

    # Get D3 rank 7
    query = f"SELECT U.FFname from Teams as T LEFT JOIN Teams_post P ON (T.teamID=P.teamID AND T.year=P.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) " + \
            f"INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.teamID IS NULL AND T.year={year} AND L.tier=3 ORDER BY L.id ASC, T.wins DESC, T.pointsFor DESC"
    cursor.execute(query)
    d3_seventh = cursor.fetchall()
    # This is a bit weird, but we actually got all non-playoff teams here, ordered by division then by ranking.
    # So we only take every 9th value in order to get the actual 7th place teams in each division
    for team in d3_seventh[::8]:
        d3.append(team["FFname"])

    # Get D4 semifinalists
    query = f"SELECT U.FFname from Teams_post as P INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year) INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year) " + \
            f" INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE P.year={year} AND L.tier=4 AND ((P.wins >= 1 AND P.seed >= 3) OR (P.seed < 3))"
    cursor.execute(query)
    d4_semifinalists = cursor.fetchall()
    for team in d4_semifinalists:
        d3.append(team["FFname"])

def GenerateD4List():
    # Get all players from last year
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) WHERE T.year={year}"
    cursor.execute(query)
    all_teams = cursor.fetchall()
    for team in all_teams:
        d4.append(team["FFname"])

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
    # Get PF ranks of just D1 and D2 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND (L.tier=1 OR L.tier=2 OR L.tier=3) ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        d2_fill.append(team["FFname"])

def GenerateD3FillOrder():
    # Get PF ranks of just D1 and D2 managers
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

GenerateD1List()
d1 = sorted(set(d1), key=lambda x: d1.index(x)) # Remove duplicates

GenerateD2List()
d2 = sorted(set(d2), key=lambda x: d2.index(x)) # Remove duplicates
d2 = [i for i in d2 if i not in d1] # Remove users already in D1

GenerateD3List()
d3 = sorted(set(d3), key=lambda x: d3.index(x)) # Remove duplicates
d3 = [i for i in d3 if i not in d1 and i not in d2] # Remove users already in D1 or D2

GenerateD1FillOrder()
d1_fill = [i for i in d1_fill if i not in d1] # Remove users already in D1

GenerateD2FillOrder()
d2_fill = [i for i in d2_fill if i not in d1 and i not in d2] # Remove users already in D1 or D2

GenerateD3FillOrder()
d3_fill = [i for i in d3_fill if i not in d1 and i not in d2 and i not in d3] # Remove users already in D1 or D2 or D3

GenerateD4List()
d4 = [i for i in d4 if (i not in d1 and i not in d2 and i not in d3)] # Remove users already in D1 or D2 or D3

GenerateTenureList()
tenure = list(set(tenure)) # Remove duplicates
tenure.sort()

for manager in tenure:
    print(manager)
