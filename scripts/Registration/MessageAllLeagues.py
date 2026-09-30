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

title = f"Minor Settings Update for Drafts (Autodraft issues)"
message = f"""If you haven't been following along in Discord, two of our first three drafts have had
a team autodraft 7 goalies in early to mid rounds. We aren't sure why this is happening this year but it hasn't happened before.
In order to prevent this from happening in other leagues we're setting a maximum of 4 goalies for the draft, so auto will
stop at that. After the draft we'll undo the limit. <br><br>Any questions? Pop into https://discord.com/invite/zXTUtj9 <br><br>-- Mods"""

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
