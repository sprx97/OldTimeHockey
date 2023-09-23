import os
import pymysql
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import Config
import Shared

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
f.close()

DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
cursor = DB.cursor()

# D1 Assignments
def GenerateD1List():
    d1 = []

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

    print(len(d1), d1)
    return d1

# D2 Assignments
def GenerateD2List():
    d2 = []

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

    print(len(d2), d2)
    return d2

# D3 Assignments
def GenerateD3List():
    d3 = []

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

    print(len(d3), d3)
    return d3

# Generate Fill lists for each div
# Order matters in these
def GenerateD1FillOrder():
    fill = []

    # Get PF ranks of just D1 and D2 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND (L.tier=1 OR L.tier=2) ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        fill.append(team["FFname"])

    print(fill)
    return fill

def GenerateD2FillOrder():
    fill = []

    # Get PF ranks of just D1 and D2 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} AND (L.tier=1 OR L.tier=2 OR L.tier=3) ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        fill.append(team["FFname"])

    print(fill)
    return fill

def GenerateD3FillOrder():
    fill = []

    # Get PF ranks of just D1 and D2 managers
    query = f"SELECT U.FFname from Teams as T INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year) INNER JOIN Users as U ON (T.ownerID=U.FFid) " + \
            f"WHERE T.year={year} ORDER BY T.pointsFor DESC"
    cursor.execute(query)
    ranks = cursor.fetchall()
    for team in ranks:
        fill.append(team["FFname"])

    print(fill)
    return fill

# Generate Tenure list
TENURE_NUM_YEARS = 7 # Currently back to 16-17. Needs to be adjusted.
def GenerateTenureList():
    return

GenerateD1List()
GenerateD2List()
GenerateD3List()
# Remove duplicates from each list

GenerateD1FillOrder()
GenerateD2FillOrder()
GenerateD3FillOrder()
# Remove duplicates from each list

GenerateTenureList()

