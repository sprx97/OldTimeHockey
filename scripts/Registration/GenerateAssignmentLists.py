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

# Helpers
def GetPFChamp():
    query = """
        SELECT U.FFname from Teams as T
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s
            ORDER BY T.pointsFor DESC
            LIMIT 1
    """
    cursor.execute(query, (year,))
    pf_champ = cursor.fetchall()[0]
    return pf_champ["FFname"].lower()

def GetPFChampForTier(tier):
    query = """
        SELECT U.FFname from Teams as T
            INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND L.tier=%s
            ORDER BY T.pointsFor DESC
            LIMIT 1
    """
    cursor.execute(query, (year, tier))
    pf_champ = cursor.fetchall()[0]
    return pf_champ["FFname"].lower()

def GetPlayoffTeams(tier):
    query = """
        SELECT U.FFname from Teams as T
            LEFT JOIN Teams_post as P on (T.teamID=P.teamID AND T.year=P.year)
            INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND L.tier=%s AND P.seed <= 6
        """
    cursor.execute(query, (year, tier))
    d1_playoff_teams = cursor.fetchall()
    teams = []
    for team in d1_playoff_teams:
        teams.append(team["FFname"].lower())

    return teams

def GetNonPlayoffTeams(tier):
    query = """
        SELECT U.FFname from Teams as T
            LEFT JOIN Teams_post as P on (T.teamID=P.teamID AND T.year=P.year)
            INNER JOIN Leagues as L ON (T.leagueID=L.id and T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND L.tier=%s AND (P.seed > 6 OR P.seed IS NULL)
        """
    cursor.execute(query, (year, tier))
    non_playoff_teams = cursor.fetchall()
    teams = []
    for team in non_playoff_teams:
        teams.append(team["FFname"].lower())

    return teams

def GetConsolationWinners(tier):
    query = """
        SELECT U.FFname from Teams_post as P
            INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year)
            INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE P.year=%s AND L.tier=%s AND P.wins_consolation > 0 AND P.losses_consolation = 0
        """
    cursor.execute(query, (year, tier))
    consolation_winners = cursor.fetchall()
    teams = []
    for consolation_winner in consolation_winners:
        teams.append(consolation_winner["FFname"].lower())

    return teams

def GetFinalists(tier):
    query = """
        SELECT U.FFname from Teams_post as P
            INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year)
            INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE P.year=%s AND L.tier=%s AND ((P.wins_playoff >= 2 AND P.seed >= 3) OR (P.wins_playoff >= 1 AND P.seed < 3))
        """
    cursor.execute(query, (year, tier))
    finalists = cursor.fetchall()
    teams = []
    for team in finalists:
        teams.append(team["FFname"].lower())

    return teams

def GetThirdPlaceWinners(tier):
    query = """
        SELECT U.FFname from Teams_post as P
            INNER JOIN Teams as T ON (P.teamID=T.teamID AND P.year=T.year)
            INNER JOIN Leagues as L ON (T.leagueID=L.id and P.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE P.year=%s AND L.tier=%s AND P.wins_third_place = 1
        """
    cursor.execute(query, (year, tier))
    finalists = cursor.fetchall()
    teams = []
    for team in finalists:
        teams.append(team["FFname"].lower())

    return teams

##############################################################################################################

# D1 Assignments
def GenerateD1List():
    # (1) PF Champion
    d1.append([GetPFChamp(), "PF Champ"])

    # (6) D1 playoff teams
    for team in GetPlayoffTeams(1):
        d1.append([team, "D1 Playoffs"])

    # (1) D1 Consolation bracket
    d1.append([GetConsolationWinners(1)[0], "D1 Consolation"])

    # (4) D2 finalists
    for team in GetFinalists(2):
        d1.append([team, "D2 Finalist"])

    # (2) D2 third place winners
    for team in GetThirdPlaceWinners(2):
        d1.append([team, "D2 Third Place"])

# D2 Assignments
def GenerateD2List():
    # (1) Woppa Cup Champ
    wc_champ = input("Who won the woppa cup? ").lower()
    d2.append([wc_champ, "WC Champ"])

    # (7) D1 non-playoff teams (excluding D1 consolation bracket winner who gets promoted to D1)
    for team in GetNonPlayoffTeams(1):
        d2.append([team, "D1 Non-Playoff"])

    # (6) D2 Playoff teams (excluding D2 finalists and third place winners who get promoted to D1)
    for team in GetPlayoffTeams(2):
        d2.append([team, "D2 Playoffs"])

    # (2) D2 consolation bracket winners
    for team in GetConsolationWinners(2):
        d2.append([team, "D2 Consolation"])

    # (6) D3 finalists
    for team in GetFinalists(3):
        d2.append([team, "D3 Finalist"])

    # (3) D3 third place winners
    for team in GetThirdPlaceWinners(3):
        d2.append([team, "D3 Third Place"])

    # (1) Top PF D4 team
    d2.append([GetPFChampForTier(4), "D4 PF Champ"])

# D3 Assignments
def GenerateD3List():
    # (1) Woppa Cup runner up
    wc_runnerup = input("Who was the woppa cup runner up? ").lower()
    d3.append([wc_runnerup, "WC Runnerup"])

    # (14) D2 non-playoff teams (excluding consolation bracket winners who get promoted to D2)
    for team in GetNonPlayoffTeams(2):
        d3.append([team, "D2 Non-Playoff"])

    # (9) D3 playoff teams (excluding D3 finalists and third place winners who get promoted to D2)
    for team in GetPlayoffTeams(3):
        d3.append([team, "D3 Playoffs"])

    # (3) D3 consolation bracket winners
    for team in GetConsolationWinners(3):
        d3.append([team, "D3 Consolation"])

    # (8) D4 finalists
    for team in GetFinalists(4):
        d3.append([team, "D4 Finalist"])

    # (4) D4 third place winners
    for team in GetThirdPlaceWinners(4):
        d3.append([team, "D4 Third Place"])

    # (1) Top PF D5 team
    d3.append([GetPFChampForTier(5), "D5 PF Champ"])

# D4 Assignments
def GenerateD4List():
    # (21) non-playoff D3 teams (excluding consolation bracket winners who get promoted to D3)
    for team in GetNonPlayoffTeams(3):
        d4.append([team, "D3 Non-Playoff"])

    # (12) D4 playoff teams (excluding D4 finalists and third place winners who get promoted to D3)
    for team in GetPlayoffTeams(4):
        d4.append([team, "D4 Playoffs"])

    # (4) D4 consolation bracket winners
    for team in GetConsolationWinners(4):
        d4.append([team, "D4 Consolation"])

    # (10+) D5 finalists
    for team in GetFinalists(5):
        d4.append([team, "D5 Finalist"])

    # (5+) D5 third place winners
    for team in GetThirdPlaceWinners(5):
        d4.append([team, "D5 Third Place"])

# D5 Assignments
def GenerateD5List():
    # (28) non-playoff D4 teams (excluding consolation bracket winners who get promoted to D4)
    for team in GetNonPlayoffTeams(4):
        d5.append([team, "D4 Non-Playoff"])

    # (15+) D5 playoff teams (excluding D5 finalists and third place winners who get promoted to D4)
    for team in GetPlayoffTeams(5):
        d5.append([team, "D5 Playoffs"])

    # (35+) non-playoff D5 teams (excluding consolation bracket winners who get promoted to D4)
    for team in GetNonPlayoffTeams(5):
        d5.append([team, "D5 Non-Playoff"])

##############################################################################################################

# Generate Fill lists for each div
# Order matters in these
def GenerateD1FillOrder():
    # Get PF ranks of just D1 and D2 managers
    query = """
        SELECT U.FFname from Teams as T
            INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND (L.tier=1 OR L.tier=2)
            ORDER BY T.pointsFor DESC
        """
    cursor.execute(query, (year,))
    ranks = cursor.fetchall()
    for team in ranks:
        d1_fill.append(team["FFname"].lower())

def GenerateD2FillOrder():
    # Get PF ranks of just D2-D3 managers
    query = """
        SELECT U.FFname from Teams as T
            INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND (L.tier=2 OR L.tier=3)
            ORDER BY T.pointsFor DESC
        """
    cursor.execute(query, (year,))
    ranks = cursor.fetchall()
    for team in ranks:
        d2_fill.append(team["FFname"].lower())

def GenerateD3FillOrder():
    # Get PF ranks of just D3-D4 managers
    query = """
        SELECT U.FFname from Teams as T
            INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND (L.tier=3 OR L.tier=4)
            ORDER BY T.pointsFor DESC
        """
    cursor.execute(query, (year,))
    ranks = cursor.fetchall()
    for team in ranks:
        d3_fill.append(team["FFname"].lower())

def GenerateD4FillOrder():
    # Get PF ranks of just D4-D5 managers
    query = """
        SELECT U.FFname from Teams as T
            INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year)
            INNER JOIN Users as U ON (T.ownerID=U.FFid)
            WHERE T.year=%s AND (L.tier=4 OR L.tier=5)
            ORDER BY T.pointsFor DESC
        """
    cursor.execute(query, (year,))
    ranks = cursor.fetchall()
    for team in ranks:
        d4_fill.append(team["FFname"].lower())

##############################################################################################################

def EliminateDupes(data, seen=[]):
    result = []
    for item in data:
        if item[0] not in seen:
            seen.append(item[0])
            result.append(item)
    return result

def DisplayTier(tier, division_list, fill_list):
    print(f"\n---- D{tier} ----")
    for manager in division_list:
        print(manager[1], manager[0])

    if fill_list:
        print(f"---- D{tier} Fill ({14*tier - len(division_list)}) ----")
        for manager in fill_list:
            print(manager)

##############################################################################################################

GenerateD1List()
d1 = EliminateDupes(d1)
seen = [t[0] for t in d1]
GenerateD1FillOrder()
d1_fill = [i for i in d1_fill if i not in {t[0] for t in d1}]
DisplayTier(1, d1, d1_fill)

GenerateD2List()
d2 = EliminateDupes(d2, seen)
seen += [t[0] for t in d2]
GenerateD2FillOrder()
d2_fill = [i for i in d2_fill if i not in {t[0] for t in d1} and i not in {t[0] for t in d2}]
DisplayTier(2, d2, d2_fill)

GenerateD3List()
d3 = EliminateDupes(d3, seen)
seen += [t[0] for t in d3]
GenerateD3FillOrder()
d3_fill = [i for i in d3_fill if i not in {t[0] for t in d1} and i not in {t[0] for t in d2} and i not in {t[0] for t in d3}]
DisplayTier(3, d3, d3_fill)

GenerateD4List()
d4 = EliminateDupes(d4, seen)
seen += [t[0] for t in d4]
GenerateD4FillOrder()
d4_fill = [i for i in d4_fill if i not in {t[0] for t in d1} and i not in {t[0] for t in d2} and i not in {t[0] for t in d3} and i not in {t[0] for t in d4}]
DisplayTier(4, d4, d4_fill)

GenerateD5List()
d5 = EliminateDupes(d5, seen)
DisplayTier(5, d5, None) # No fill for D5 since it's the lowest tier

##############################################################################################################

# Generate Tenure list
# TENURE_NUM_YEARS = 5 # Currently back to 20-21. Needs to be adjusted.
# def GenerateTenureList():
#     # Get all the D1 members from the past TENURE_NUM_YEARS years
#     query = """
#         SELECT DISTINCT U.FFname from Teams as T
#             INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year)
#             INNER JOIN Users as U ON (T.ownerID=U.FFid)
#             WHERE T.year>%s AND L.tier=1
#         """
#     cursor.execute(query, (year - TENURE_NUM_YEARS,))
#     d1_teams = cursor.fetchall()
#     for team in d1_teams:
#         tenure.append(team["FFname"].lower())

#     # Get all the D2 playoff teams from the past TENURE_NUM_YEARS years
#     query = """
#         SELECT DISTINCT U.FFname from Teams as T
#             INNER JOIN Teams_post as P ON (T.teamID=P.teamID AND T.year=P.year)
#             INNER JOIN Leagues as L ON (T.leagueID=L.id AND T.year=L.year)
#             INNER JOIN Users as U ON (T.ownerID=U.FFid)
#             WHERE T.year>%s AND L.tier=2
#         """
#     cursor.execute(query, (year - TENURE_NUM_YEARS,))
#     d2_playoff_teams = cursor.fetchall()
#     for team in d2_playoff_teams:
#         tenure.append(team["FFname"].lower())

# Tenured managers get fast tracked to D4 this year if necessary
# GenerateTenureList()
# tenure = list(set(tenure)) # Remove duplicates
# tenure.sort()

# print("\n---- Tenure ----")
# for manager in tenure:
#     print(manager)
