import urllib.request # url reading
from lxml import etree
from lxml import html # xml parsing
import pymysql # sql queries
import sys
import Config
import re

years_to_update = [] # can manually seed if necessary
playoffs_to_update = []

if len(sys.argv) == 1: # no arguments
    f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
    year = int(f.readline().strip())
    years_to_update.append(year)

    if int(f.readline().strip()) > 23: # most years only have 23 weeks
        playoffs_to_update.append(year)
    f.close()
else:
    for arg in sys.argv[1:]:
        if len(arg) == 4:
            years_to_update.append(int(arg))
        elif len(arg) == 5 and arg[-1] == "p":
            playoffs_to_update.append(int(arg[:-1]))
        else:
            print("Invalid argument")
            quit()

def printHtml(root, depth):
    for n in range(0, depth):
        print(" ", end='')
    print(depth, end='')
    print(root.tag, root.get("class"), root.text)
    for child in root:
        printHtml(child, depth+1)

# More error-safe parseInt and parseFloat methods
def intP(str):
    if str == "":
        return 0
    return int(str)

def floatP(str):
    if str == "":
        return 0.0
    return float(str)

# Checks the standings pages of the given league and updates the datafile
def getStandings(leagueID, year):
    standingsURL = "http://www.fleaflicker.com/nhl/leagues/" + str(leagueID) + "?season=" + str(year)
    response = urllib.request.urlopen(standingsURL)
    page = response.read()
    root = html.document_fromstring(page)

    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #                                                             #
    #  Need some sort of error handling for if the HTML changes.  #
    #                                                             #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

    leadersTabURL = "http://www.fleaflicker.com/nhl/leagues/" + str(leagueID) + "/leaders?season=" + str(year)
    response2 = urllib.request.urlopen(leadersTabURL)
    page2 = response2.read()
    root2 = html.document_fromstring(page2)
    rows2 = root2.cssselect(".table-group")[0].findall("tr");
    coachRating = {}
    optimumPF = {}
    numrows = len(rows2)-1
    if numrows % 2 != 0:
        numrows += 1
    for n in range(0, numrows):
        teamID = rows2[n].cssselect(".league-name")[0].findall("a")[0].get("href")
        if "?season" in teamID:
            teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
        else:
            teamID = teamID[(teamID.find("/teams/") + 7):]

        try:
            val = rows2[n][10].text_content().replace(",","")

            optimumPF[teamID] = floatP(val.split("(")[0])
            coachRating[teamID] = floatP(val.split("(")[1][:-2])
        except:
            print("Trouble Finding Coach Rating")
            coachRating[teamID] = 0.0
            optimumPF[teamID] = 0.0

    all_teams = []

    rows = root.cssselect(".table-striped")[0].findall("tr")
    for n in range(0, len(rows)):
        division = None # relic from older code
        user = rows[n][1].text_content()
        # 2 is just a horizontal spacer
        wins = intP(rows[n][3].text_content())
        losses = intP(rows[n][4].text_content())
        # 5 is win %, which we can just calculate
        try:
            gamesBack = intP(rows[n][6].text_content())
        except:
            gamesBack = 0
        # post = rows[n][7].text_content()
        # if len(post) > 0:
        #     wins += intP(post[:post.index("-")])
        #     losses += intP(post[post.index("-")+1:])

        try:
            streak = rows[n][8].text_content()
            if streak[0] == 'L':
                streak = -1*intP(streak[1:])
            else:
                streak = intP(streak[1:])
            # 9 is another spacer
            PF = floatP(rows[n][10].text_content().replace(",", ""))
            # 11 is average PF
            PA = floatP(rows[n][12].text_content().replace(",", ""))
            # 13 is average PA
        except: # Week one standings page looks weird (no "post" column)
            streak = rows[n][7].text_content()
            if len(streak) != 0 and streak[0] == 'L':
                streak = -1*intP(streak[1:])
            else:
                streak = intP(streak[1:])
            # 8 is a spacer
            PF = floatP(rows[n][9].text_content().replace(",", ""))
            PA = floatP(rows[n][10].text_content().replace(",", ""))


        try:
            userID = rows[n].cssselect(".user-name")[0].get("href")
            userID = userID[(userID.find("/users/") + 7):]
        except:
            userID = 0 # If the user has abandoned the team
        teamname = rows[n].cssselect(".league-name")[0].text_content()
        teamID = rows[n].cssselect(".league-name")[0].findall("a")[0].get("href")
        if "?season" in teamID:
            teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
        else:
            teamID = teamID[(teamID.find("/teams/") + 7):]

        # PF = corrected_pf[teamID][0]
        CR = coachRating[teamID]

        isChamp = len(rows[n].cssselect(".fa-trophy")) > 0

        all_teams.append([teamID, teamname, userID, user, division, wins, losses, gamesBack, streak, PF, PA, CR, isChamp])

    return all_teams

def getPlayoffs(leagueID, year):
    playoffsURL = "http://www.fleaflicker.com/nhl/leagues/" + str(leagueID) + "/playoffs?season=" + str(year)
    response = urllib.request.urlopen(playoffsURL)
    page = response.read()
    root = html.document_fromstring(page)
    bracket = root.cssselect(".playoff-bracket")[0]

    teams = {}
    brackets = bracket.cssselect(".league-name");
    for n in range(0, len(brackets)):
        team = brackets[n]
        teamID = team.findall("a")[0].get("href")
        if "?season" in teamID:
            teamID = teamID[(teamID.find("/teams/") + 7):teamID.find("?season")]
        else:
            teamID = teamID[(teamID.find("/teams/") + 7):]
        points = team.getnext()

        if points != None:
            if teamID in teams:
                teams[teamID][2] += floatP(points.text_content())
            else:
                teams[teamID] = [0, 0, floatP(points.text_content()), 0.0, 0]
            teams[teamID][0] += len(points.cssselect(".scoreboard-win"))
            teams[teamID][1] += 1-len(points.cssselect(".scoreboard-win"))

        # points against... kinda hacky
        if n == 0:
            teams[teamID][3] += floatP(brackets[3].getnext().text_content())
            teams[teamID][4] = 1
        if n == 1:
            teams[teamID][3] += floatP(brackets[9].getnext().text_content())
        if n == 2:
            teams[teamID][3] += floatP(brackets[4].getnext().text_content())
            teams[teamID][4] = 4
        if n == 3:
            teams[teamID][3] += floatP(brackets[0].getnext().text_content())
        if n == 4:
            teams[teamID][3] += floatP(brackets[2].getnext().text_content())
            teams[teamID][4] = 5
        if n == 6:
            teams[teamID][3] += floatP(brackets[8].getnext().text_content())
            teams[teamID][4] = 3
        if n == 7:
            teams[teamID][3] += floatP(brackets[10].getnext().text_content())
        if n == 8:
            teams[teamID][3] += floatP(brackets[6].getnext().text_content())
            teams[teamID][4] = 6
        if n == 9:
            teams[teamID][3] += floatP(brackets[1].getnext().text_content())
        if n == 10:
            teams[teamID][3] += floatP(brackets[7].getnext().text_content())
            teams[teamID][4] = 2

    return teams

def demojify(text):
    regex_pattern = re.compile(pattern="["
        u"\U0001F600-\U0001F64F" # emoticons
        u"\U0001F300-\U0001F5FF" # symbols & pictographs
        u"\U0001F680-\U0001F6FF" # transport & map symbols
        u"\U0001F1E0-\U0001F1FF" # flags (iOS)
        "]+", flags = re.UNICODE)
    return regex_pattern.sub(r'', text)

if __name__ == "__main__":
    db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
    cursor = db.cursor()

    for year in years_to_update:
        cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
            teams = getStandings(league[0], league[1])
            for next in teams:
                next[1] = next[1].replace(";", "") # prevent sql injection
                next[1] = next[1].replace("'", "''") # correct quote escaping
                next[1] = next[1].replace(u"\u2019", "''") # another type of quote?
                next[1] = demojify(next[1])
                next[3] = next[3].replace(";", "") # prevent sql injection
                next[3] = next[3].replace("'", "''") # correct quote escaping
                try:
                    if next[3][-2] == "+":
                        next[3] = next[3][:-3] # elimites "+1" for managers with co-managers
                except:
                    pass                            

                if str(next[2]) == "591742":
                    next[2] = 157129 # override for rellek multi accounts...
                elif str(next[2]) == "698576":
                    next[2] = 1357398 # override for MWHazard's old account

                cursor.execute("SELECT * from Teams where teamID = " + next[0] + " AND year=" + str(year))
                data = cursor.fetchall()
                if len(data) == 0: # insert new team into table (should only happen once)
                    # print(next[1])
                    cursor.execute("INSERT into Teams values (" + str(next[0]) + ", " + str(league[0]) + ", " + str(next[2]) + ", '" + \
                    next[1] + "', " + str(next[5]) + ", " + str(next[6]) + ", " + str(next[7]) + ", " + str(next[8]) + ", " + \
                    str(next[9]) + ", " + str(next[10]) + ", 0, " + str(next[11]) + ", " + str(next[12]) +  ", 0.0, 0.0, -1, -1," + str(next[2]) + ", " + str(year) + ")")

                elif len(data) == 1:
                    if intP(data[0][2]) != intP(next[2]) and intP(next[2]) != 0:
                        cursor.execute("UPDATE Teams set ownerID=" + str(next[2]) + ", replacement=1 where teamID=" + str(next[0]) + " AND year=" + str(year))

                    cursor.execute("UPDATE Teams set  name='" + next[1] + \
                    "', wins=" + str(next[5]) + ", losses=" + str(next[6]) + ", gamesBack=" + str(next[7]) + \
                    ", streak=" + str(next[8]) + ", pointsFor=" + str(next[9]) + ", pointsAgainst=" + str(next[10]) + \
                    ", coachRating=" + str(next[11]) + ", isChamp=" + str(next[12]) +  " where teamID=" + str(next[0]) + " AND year=" + str(year))
                else:
                    raise Exception("Error: more than one team matches teamID: " + str(next[0]))

                # only update the user if there is actually another user
                if (next[2] != 0):
                    cursor.execute("SELECT * from Users where FFid = " + str(next[2]))
                    data = cursor.fetchall()
                    if len(data) == 0: # insert new user into table (should only happen once)
                        cursor.execute("INSERT into Users values (" + str(next[2]) + ", '" + next[3] + \
                                        "', NULL)")
                    elif len(data) == 1:
                        cursor.execute("UPDATE Users set FFname='" + next[3] \
                        + "' where FFid=" + str(next[2]))
                    else:
                        raise Exception("Error: more than one user matches userID: " + str(next[2]))

    for year in playoffs_to_update:
        cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
            teams_post = getPlayoffs(league[0], league[1])
            for next in teams_post:
                cursor.execute("SELECT * from Teams_post where teamID = " + next + " AND year=" + str(year))
                data = cursor.fetchall()
                if len(data) == 0: # new team
                    cursor.execute("INSERT into Teams_post values (" + next + ", " + str(teams_post[next][0]) + ", " + str(teams_post[next][1]) + \
                    ", " + str(teams_post[next][2]) + ", " + str(teams_post[next][3]) + ", " + str(teams_post[next][4]) + ", " + str(year) +  ")")
                elif len(data) == 1:
                    cursor.execute("UPDATE Teams_post set wins=" + str(teams_post[next][0]) + ", losses=" + str(teams_post[next][1]) + \
                    ", pointsFor=" + str(teams_post[next][2]) + ", pointsAgainst=" + str(teams_post[next][3]) + ", seed=" + str(teams_post[next][4]) + " where teamID=" + next + " AND year=" + str(year))
                else:
                    raise Exception("Error: more than one team matches teamID: " + next)

    db.commit()
