# Python includes
import datetime
import os
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

DEBUG = True

# Comment this out to actually run the script.
# This script is scary so leave this on in case of a fatfinger python command
print("Aborting due to failsafe")
quit()

# Failsafe 1
print("Are you sure you want to randomize draft orders? (yes/no)")
confirm = input()
if confirm != "yes":
    print("Aborting.")
    quit()

# Failsafe 2
print("Are you REALLY sure you want to randomize draft orders? This should only be done once per league. (yes/no)")
confirm = input()
if confirm != "yes":
    print("Aborting.")
    quit()

# Failsafe 3
d = datetime.datetime.now()
month = int(d.strftime("%m"))
if month >= 10 or month <= 6:
    print("Why are we randomizing draft orders during the season? Please be sure you want to do this.")
    quit()

# Get the login session for OTHAdmin
session = requests.session()
session.post("https://www.fleaflicker.com/nhl/login", data={"email":Config.config["fleaflicker_email"], "password":Config.config["fleaflicker_password"], "keepMe":"true"})

# Get all of the league IDs
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip()) + 1
leagues = Shared.get_leagues_from_database(year)
if len(leagues) == 0:
    print(f"No leagues for {year} in database. Ensure WeekVars and DB are correct.")
    quit()

league_standings_url = "https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={}&season=" + str(year)
league_activity_url = "https://www.fleaflicker.com/api/FetchLeagueActivity?sport=NHL&league_id={}"
draft_order_setting_url = "https://www.fleaflicker.com/nhl/leagues/{}/settings/draft-order"
message_url = "https://www.fleaflicker.com/nhl/leagues/{}/messages/new"

def try_randomize_league(id):
    # If any team is unclaimed, don't randomize yet
    teams = requests.get(league_standings_url.format(id)).json()["divisions"][0]["teams"]
    for team in teams:
        if "owners" not in team:
            print(f"{id} is not full.")
            return

    # If the league isn't active, don't randomize yet
    activity = requests.get(league_activity_url.format(id)).json()["items"]
    league_renew_item = activity[-1]
    if "settings" not in league_renew_item or "schedule has been automatically generated." not in league_renew_item["settings"]["description"]:
        print(f"{id} appears to have not been renewed yet.")
        return

    # If the draft order has already been randomized, don't do it again
    for item in activity:
        if "settings" not in item:
            continue

        if "The draft order has been randomly generated." == item["settings"]["description"]:
            print(f"{id} has already been randomized.")
            return

    # If we pass the above checks, we can randomize the draft order
    draft_order_data = {
        "randomize": "true"
    }
    print("Randomizing...")
    if not DEBUG:
        session.post(draft_order_setting_url.format(id), draft_order_data)

    # Now grab the newly-generated draft order to post to the message board
    draft_order = []
    teams = requests.get(league_standings_url.format(id)).json()["divisions"][0]["teams"] # re-get this for updated data
    for team in teams:
        draft_order.append((team["owners"][0]["displayName"] if "owners" in team else "NONE", team["draftPosition"]))
    draft_order = sorted(draft_order, key=lambda x: x[1])

    draft_order_message = "Draft order generated:<br>" + "<br>".join(f"{x[1]}. {x[0]}" for x in draft_order)
    print(draft_order_message.replace("<br>", "\n"))
    draft_order_message_data = {
        "parentId": "",
        "editId": "",
        "title": "Draft Order Generated",
        "contents": draft_order_message,
        "emailAll": "true"
    }
    if not DEBUG:
        session.post(message_url.format(id), draft_order_message_data)
    
for league in leagues:
    id = league["id"]
    name = league["name"]

    print(f"Randomizing {name}")
    try_randomize_league(id)
