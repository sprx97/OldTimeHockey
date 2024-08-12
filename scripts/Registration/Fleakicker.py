# Python includes
import datetime
import os
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

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
    return

activate_url = "https://www.fleaflicker.com/nhl/leagues/{}/activate"
message_url = "https://www.fleaflicker.com/nhl/leagues/{}/messages/new"
kick_url = 'https://www.fleaflicker.com/nhl/leagues/{}/settings/owners/remove'

form = "https://forms.gle/DAn53vF5JTsU1W8L6"
form_year = 2024
if form_year != year+1:
    print(f"Form in registration post has not been updated.")
    return
kick_message = f"OTH {year+1}-{year+2} is about to begin! These leagues are being cleared and new invites will go out shortly, so if you're receiving this and haven't signed up, " + \
               "please fill out the registration form here and check the discord/subreddit for more info: {form}. ALL RETURNING TEAMS MUST REGISTER. If you have any issues tag @mods on the Discord or DM via reddit for help!"
kick_message_data = {
    "parentId": "",
    "editId": "",
    "title": "Clearing divisions in preparation for next season",
    "contents": kick_message,
    "emailAll": "true"
}

season_num = year-2010
invite_message = f"Welcome back to OTH for our {season_num}th season! Draft date/time is FINAL, but " + \
"draft order is NOT FINAL. Draft order will be randomized once everyone has joined. " + \
"League assignments were made based on availability on the registration form. " + \
"If your availability has changed tag @mods on https://discord.com/invite/zXTUtj9 and we'll try to help."

invite_message_data = {
    "parentId": "",
    "editId": "",
    "title": f"Welcome to OldTimeHockey {year+1}-{year+2}!",
    "contents": invite_message,
    "emailAll": "false"
}

# TODO: Also set the trade deadline, playoff schedule, and other settings if necessary
#       I'm not sure if this is automatable, but it's a pain to do manually.
#	Also may not be able to do it because flea drags their feet on schedule stuff.
def boot_teams(league_id):
    response = requests.get(f"https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league_id}&season={year+1}")
    teams = response.json()["divisions"][0]["teams"]
    for team in teams:
        session.post(kick_url.format(league_id), data={"teamId": team["id"], "reason": 6})

for league in leagues:
    id = league["id"]
    name = league["name"]

    # Skip D1
    if id == 12086:
        continue

    # Activate league
    print(f"Activating {name}")
    session.post(activate_url.format(id))

    # Post kick message board message
    print(f"Messaging {name}")
    session.post(message_url.format(id), kick_message_data)

    # Kick all managers
    print(f"Removing owners from {name}")
    boot_teams(id)

    # Post invite message board message
    print(f"Messaging {name}\n")
    session.post(message_url.format(id), invite_message_data)
