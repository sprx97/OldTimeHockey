# Checks scores to update daily/weekly scoring records

import urllib.request # url reading
from lxml import etree
from lxml import html # xml parsing
import pymysql # sql queries
import smtplib
from email.mime.text import MIMEText
import Config

# Check for argument (for weekly vs backfill)
# Find all weekly scores for week
# Find all daily scores for week
# Differentiate 12 vs 14 team leagues
# Discount long weeks
# Update tables if necessary

def getWeekStart(year, week):
    if week == 1:
        return 1
    if year == 2012 or year == 2013:
        week -= 1
    shift = 6
    if year in weekShift.keys():
        shift = weekShift[year]
    return shift + 7*(week-2)

weeklyHighs = []
dailyHighs = []

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
week = 3
f.close()

# only check the most recent week
years_to_update = [year] # can maually seed if necessary
weekIDs = [1, 6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 97, 104, 111, 118, 125, 132, 139, 146, 153, 160, 167, 174]
weekIDs = weekIDs[week-1:week]
weekShift = {2012 : 10, 2013 : 7, 2014 : 6, 2015 : 6, 2016 : 6 }

MAX_LEN = 5
def insertIntoWeeklyHighs(score1, score2):
    # insert first score if necessary
    inserted = False
    for n in range(0, len(weeklyHighs)):
        if score1 >= weeklyHighs[n][0]:
            weeklyHighs.insert(n, [score1, team1, league[0], year, weekIndex])
            inserted = True
            break
    if not inserted and len(weeklyHighs) < MAX_LEN:
        weeklyHighs.append([score1, team1, league[0], year, weekIndex])
        inserted = True

    # insert second score if necessary
    inserted2 = False
    for n in range(0, len(weeklyHighs)):
        if score2 >= weeklyHighs[n][0]:
            weeklyHighs.insert(n, [score2, team2, league[0], year, weekIndex])
            inserted2 = True
            break
    if not inserted2 and len(weeklyHighs) < MAX_LEN:
        weeklyHighs.append([score2, team2, league[0], year, weekIndex])
        inserted2 = True

    # trim the list down
    while (inserted or inserted2) and len(weeklyHighs) > MAX_LEN:
        if weeklyHighs[-1][0] == weeklyHighs[-2][0] == weeklyHighs[MAX_LEN-1][0]:
            break
        weeklyHighs.pop()

def insertIntoDailyHighs(team, score, index):
    inserted = False
    for n in range(0, len(dailyHighs)):
        if score >= dailyHighs[n][0]:
            dailyHighs.insert(n, [score, team, league[0], year, weekIndex, index, matchid]) # week and index can be used to find the actual date
            inserted = True
            break

    if not inserted and len(dailyHighs) < MAX_LEN:
        dailyHighs.append([score, team, league[0], year, weekIndex, index, matchid]) # week and index can be used to find the actual date
        inserted = True

    # trim the list down to 5
    while inserted and len(dailyHighs) > MAX_LEN:
        if dailyHighs[-1][0] == dailyHighs[-2][0] == dailyHighs[MAX_LEN-1][0]:
            break
        dailyHighs.pop()

if __name__ == "__main__":
    for year in years_to_update:
        cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
            for weekid in weekIDs:
                if year == 2012 and weekid == 1:
                    continue # first week of 2012 was weird
                weekIndex = weekIDs.index(weekid)
                if year != 2012:
                    weekIndex += 1

                URL = "http://www.fleaflicker.com/nhl/leagues/" + str(league[0]) + "/scores?season=" + str(year) + "&week=" + str(weekid)
                print(URL)
                response = urllib.request.urlopen(URL)
                page = response.read()
                root = html.document_fromstring(page)
                response.close()

                if len(root.cssselect(".scoreboard-win")) == 0:
                    print("Scores for " + league[2] + " " + str(year) + " week ID " + str(weekid) + " not final")
                    continue

                # get each individual box score link
                boxes = root.cssselect(".pull-right.btn-group")
                for box in boxes:
                    boxlink = box.cssselect("a")[0].get("href")
                    boxlink = "http://www.fleaflicker.com" + boxlink
                    matchid = boxlink[boxlink.find("scores/")+7:]

                    response2 = urllib.request.urlopen(boxlink)
                    page2 = response2.read()
                    boxroot = html.document_fromstring(page2)

                    # gets the two team IDs
                    team1 = boxroot.cssselect(".league-name a")[0].get("href")
                    if "?season" in team1:
                        team1 = team1[(team1.find("/teams/") + 7):team1.find("?season")]
                    else:
                        team1 = team1[(team1.find("/teams/") + 7):]
                    team2 = boxroot.cssselect(".league-name a")[1].get("href")
                    if "?season" in team2:
                        team2 = team2[(team2.find("/teams/") + 7):team2.find("?season")]
                    else:
                        team2 = team2[(team2.find("/teams/") + 7):]

                    days = boxroot.cssselect(".boxscore td.text-right")

                    # gets daily estimates (need to navigate to daily page to get exact decimal scoring)
                    count = 0
                    for day in days:
                        # skip the totals for each team
                        if count == (len(days)-1) or count == (len(days)/2 - 1):
                            count += 1
                            continue

                        # skip 2012 Roy Week 2 because WEIRD
                        if year == 2012 and league[0] == 3914 and (weekIndex) == 2:
                            break

                        # figure out which team had this score
                        team = team1
                        index = count
                        if count > len(days) / 2 - 1:
                            team = team2
                            index -= len(days)/2

                        insertIntoDailyHighs(team, int(day.text_content()), index)

                        count += 1

                    if (len(days)/2)-1 > 7:
                        print("Skipping " + str(year) + " week " + str(weekIndex) + " - long week")
                        continue

                    score1 = float(days[int(len(days)/2) - 1].text_content())
                    score2 = float(days[-1].text_content())

                    insertIntoWeeklyHighs(score1, score2)

    body = ""
    for high in weeklyHighs:
        body += str(high) + "\n"
    for high in dailyHighs:
        url = "www.fleaflicker.com/nhl/leagues/" + str(high[2]) + "/scores/" + high[6] + "?season=" + str(high[3]) + "&week=" + str(getWeekStart(high[3], high[4]) + high[5])
        body += str(high) + ", " + url + "\n"

    try:
        msg = MIMEText(body)
        msg["Subject"] = "Check Daily/Weekly HOF records for week " + str(week)
        msg["From"] = "no-reply@roldtimehockey.com"
        recips = ["jeremy.vercillo@gmail.com"]
        msg["To"] = ",".join(recips)

        s = smtplib.SMTP("localhost")
        s.sendmail(msg["From"], recips, msg.as_string())
        s.quit()

        print("HOF Email Sent")
    except Exception as e:
        print("Error sending HOF email.")
        print(e)


