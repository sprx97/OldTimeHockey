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

title = f"OldTimeHockey weekly adds will reset at 12:01am ET on Wednesday"
message = f"There's been a bit of confusion with what is happening with adds. In previous years fleaflicker has reset adds after the empty weeks. That has not happened yet this year, so the plan is to " + \
          f"manually reset them at approximately 12:01am ET on Wednesday (unless Flea beats us to it). All of the information spread on the Discord claimed they would, so we were caught off guard when Flea didn't reset things this morning. Apologies for the confusion." + \
          f"<br><br>Any questions, pop into https://discord.com/invite/zXTUtj9 <br><br>-- Mods"
data = {
    "parentId": "",
    "editId": "",
    "title": title,
    "contents": message,
    "emailAll": "true"
}

for league in leagues:
    id = league["id"]8
    name = league["name"]

    # Post message board message
    print(f"Messaging {name}")
    # session.post("https://www.fleaflicker.com/nhl/leagues/{}/messages/new".format(id), data)
