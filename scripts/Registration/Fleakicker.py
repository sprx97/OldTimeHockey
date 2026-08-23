# Python includes
import datetime
import os
import requests
import sys
import time

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

# NB: Fleaflicker limits us to 90 requests per minute. This script uses a lot.
#     For each league (15x), we have:
#     - 1 call to reactivate the league
#     - 1 call to post the kick message
#     - 1 call to get the league standings (to get team IDs)
#     - 14 calls to remove all the teams from the league
#     - 2 calls to update settings (playoffs and trade deadline)
#     - 1 call to post the welcome message
#
#     Total: 20 calls per league, 15 leagues = 300 calls. Meaning we need a wait after every league.

# Swap this to actually commit changes instead of just printing stuff
DEBUG = False

# Comment this out to actually run the script.
# This script is scary so leave this on in case of a fatfinger python command
# print("Aborting due to failsafe")
# quit()

# Failsafe 1
print("Are you sure you want to run fleakicker.py? (yes/no)")
confirm = input()
if confirm != "yes":
    print("Aborting.")
    quit()

# Failsafe 2
print("Are you REALLY sure you want to run fleakicker.py? This will boot all managers from all OTH leagues and is irreversable. (yes/no)")
confirm = input()
if confirm != "yes":
    print("Aborting.")
    quit()

# Failsafe 3
d = datetime.datetime.now()
month = int(d.strftime("%m"))
if month >= 10 or month <= 6:
    print("Why are we running fleakicker during the season? Please be sure you want to do this.")
    quit()

# Get the login session for OTHAdmin
session = requests.session()
session.post("https://www.fleaflicker.com/nhl/login", data={"email":Config.config["fleaflicker_email"], "password":Config.config["fleaflicker_password"], "keepMe":"true"})

# Get all of the league IDs
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip()) # Will be previous season's year
leagues = Shared.get_leagues_from_database(year)
if len(leagues) == 0:
    print(f"No leagues for {year} in database. Ensure WeekVars and DB are correct.")
    quit()

discord = "https://discord.com/invite/zXTUtj9"
form = "https://forms.gle/mGznBPwf4KQVPBtt8"
form_year = 2026
if form_year != year+1:
    print(f"Form in registration post has not been updated.")
    quit()

# NB: If you want to put spaces into this, use <br> instead of \n
kick_message = f"OTH {year+1}-{year+2} is about to begin! These leagues are being cleared and new the new registration is open! If you're receiving this and haven't signed up, " + \
               f"please fill out the registration form <a href='{form}'>{form}</a> and check <a href='{discord}'>{discord}</a> for more info. " + \
               f"ALL RETURNING TEAMS MUST REGISTER. If you have any issues tag @mods on Discord for help!"
kick_message_data = {
    "parentId": "",
    "editId": "",
    "title": "Clearing divisions in preparation for next season",
    "contents": kick_message,
    "emailAll": "true"
}
print(kick_message_data)

season_num = year-2010
welcome_message = f"<p>Welcome back to OTH for season {season_num}! Draft date/time is FINAL, but " + \
                 "draft order is NOT FINAL. Draft order will be randomized once everyone has joined. " + \
                 "League assignments were made based on availability on the registration form. " + \
                 f"If your availability has changed, tag @mods on <a href='{discord}'>{discord}</a> and we'll try to help.</p>"
welcome_message_data = {
    "html": welcome_message,
    "expiryDate": f"09/29/{year+1}"
}
print(welcome_message_data)

def boot_teams(league_id):
    response = requests.get(f"https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league_id}&season={year+1}")
    teams = response.json()["divisions"][0]["teams"]
    for team in teams:
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/settings/owners/remove".format(league_id), data={"teamId": team["id"], "reason": 6})

def update_settings(league_id):
    # Playoff settings
    session.post("https://www.fleaflicker.com/nhl/editPlayoffsSubmit", data={
        "leagueId": league_id,
        "holdPlayoffs": "true",
        "numPlayoffTeams": 6,
        "finalsWeek": 27, # Week ending 4/4
        "reseed": "false"
    })
    
    # Trade deadline
    session.post("https://www.fleaflicker.com/nhl/editTransactionsSubmit", data={
        "leagueId": league_id,
        "tradeDeadline": 155, # Tuesday March 2nd, 6am EST
        "tradeDeadlineUnlockAfterSeason": "false",
        # addDropDeadline: None
        "addDropDeadlineUnlockAfterSeason": "false",
        "allowIllegal": "false",
        "lockPreseason": "false",
        "lockBenchOnKickoff": "true",
        "extendTradeReview": "false",
        "allowVetoes": "true",
        "limitType": "SCHEDULE_PERIOD_ONLY",
        "periodLimit": 7,
        "resetMoves": "false"
    })

    # Tiebreak rules
    # session.post("https://www.fleaflicker.com/nhl/editTiebreaksSubmit", data={
    #     "leagueId": league_id,
    #     "gameTiebreak": "STARTER_MAX_CATEGORY,STARTER_MAX_FANTASY_POINTS,BENCH_TOTAL_FANTASY_POINTS",
    #     "breakRegularSeasonTies": "false",
    #     "rankTiebreak": "POINTS_FOR,HEAD_TO_HEAD,POINTS_AGAINST,STRENGTH_OF_SCHED"
    # })

for league in leagues:
    id = league["id"]
    name = league["name"]

    # Skip D1
    if id == 12086 or id == 12087 or id == 12088:
        continue

    if not DEBUG:
        # Activate league
        print(f"Activating {name}")
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/activate".format(id))

        # Post kick message board message
        print(f"Messaging {name}")
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/messages/new".format(id), kick_message_data)

        # Kick all managers
        print(f"Removing owners from {name}")
        boot_teams(id)

        print(f"Updating Settings for {name}")
        update_settings(id)

        # Post welcome message to sticky note
        print(f"Adding sticky note to {name}\n")
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/settings/sticky-note".format(id), welcome_message_data)

        time.sleep(30) # Wait 30 seconds to avoid hitting the 90 requests/minute limit
