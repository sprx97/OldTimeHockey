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
year = int(f.readline().strip()) # Will be previous season's year
leagues = Shared.get_leagues_from_database(year)
if len(leagues) == 0:
    print(f"No leagues for {year} in database. Ensure WeekVars and DB are correct.")
    quit()

title = f"Playoffs and Consolation Bracket Reminder"
message = f"""Hello everyone -- just a reminder that per our updated pyramid starting this year (https://roldtimehockey.com/), the 3rd and 7th place consolation brackets in D1-4 now matter 
for promotion and relegation. This is different from previous seasons so we felt it was a good idea to drop a reminder. As usual teams who are fully eliminated from the 1st, 3rd, and 7th 
place brackets are discouraged from making additional add/drops, but that's ultimately unenforceable.<br><br>Any questions? Pop into https://discord.com/invite/zXTUtj9 <br><br>-- Mods"""

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
    debug = True
    if debug:
        print(f"Not messaging {name}. Set debug to false to actually send.")
    else:
        print(f"Messaging {name}.")
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/messages/new".format(id), data)
