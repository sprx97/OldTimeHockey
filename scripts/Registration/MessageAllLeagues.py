# Python includes
import os
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config

# Get the login session for OTHAdmin
session = requests.session()
session.post("https://www.fleaflicker.com/nhl/login", data={"email":Config.config["fleaflicker_email"], "password":Config.config["fleaflicker_password"], "keepMe":"true"})

# Get all of the league IDs
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip()) + 1 # Will be previous season's year
leagues = Shared.get_leagues_from_database(year)
if len(leagues) == 0:
    print(f"No leagues for {year} in database. Ensure WeekVars and DB are correct.")
    quit()

title = f"Schedule Update and Draft Reminder"
message = f"""Hello everyone -- Fleaflicker just combined the Allstar Break weeks into a single matchup (good!), but that left our championship week too late in the season.
I'll be adjusting accordingly so you'll see a notification about the schedule being changed.<br><br>Additionally, this serves as a reminder that your draft is coming up in the next
four days. Check your league settings for the specific date/time if you've forgotten.<br><br>Any questions? Pop into https://discord.com/invite/zXTUtj9 <br><br>-- Mods"""

data = {
    "parentId": "",
    "editId": "",
    "title": title,
    "contents": message,
    "emailAll": "true"
}

for league in leagues:
    id = league["id"]
    name = league["name"]

    # Post message board message
    debug = False
    if debug:
        print(f"Not messaging {name}. Set debug to false to actually send.")
    else:
        print(f"Messaging {name}.")
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/messages/new".format(id), data)
