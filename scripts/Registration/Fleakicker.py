# Python includes
import datetime
import os
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

# Swap this to actually commit changes instead of just printing stuff
DEBUG = True

# Comment this out to actually run the script.
# This script is scary so leave this on in case of a fatfinger python command
print("Aborting due to failsafe")
quit()

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

form = "https://forms.gle/zg4s96qHQ7XUMUmA6"
form_year = 2025
if form_year != year+1:
    print(f"Form in registration post has not been updated.")
    quit()

# NB: If you want to put spaces into this, use <br> instead of \n
kick_message = f"OTH {year+1}-{year+2} is about to begin! These leagues are being cleared and new invites will go out shortly. If you're receiving this and haven't signed up, " + \
               f"please fill out the registration form ({form}) and check the discord/subreddit for more info. ALL RETURNING TEAMS MUST REGISTER. If you have any issues tag @mods on the Discord or DM via reddit for help!"
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
                 "If your availability has changed, tag @mods on <a href='https://discord.com/invite/zXTUtj9'>the discord</a> and we'll try to help.</p>"
welcome_message_data = {
    "html": welcome_message,
    "expiryDate": f"10/07/{year+1}"
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
        "finalsWeek": 26,
        "reseed": "false"
    })
    
    # Trade deadline
    session.post("https://www.fleaflicker.com/nhl/editTransactionsSubmit", data={
        "leagueId": league_id,
        "tradeDeadline": 153, # Monday March 9th, 6am EST
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
    session.post("https://www.fleaflicker.com/nhl/editTiebreaksSubmit", data={
        "leagueId": league_id,
        "gameTiebreak": "STARTER_MAX_CATEGORY,STARTER_MAX_FANTASY_POINTS,BENCH_TOTAL_FANTASY_POINTS",
        "breakRegularSeasonTies": "false",
        "rankTiebreak": "POINTS_FOR,HEAD_TO_HEAD,POINTS_AGAINST,STRENGTH_OF_SCHED"
    })

for league in leagues:
    id = league["id"]
    name = league["name"]

    # Skip D1
    if id == 12086:
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
