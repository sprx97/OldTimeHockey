# Python includes
import os
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Shared
from shared import Config
from shared.Emailer import Emailer

DEBUG = True
send_emails = True
all_emails = []

# Only allow sending of invites for one division at a time
if len(sys.argv) != 2:
    print("Please provide a division.")
    quit()

division = sys.argv[1]
if division not in ["D1", "D2", "D3", "D4", "D5"]:
    print("Division must be D1, D2, D3, D4, or D5.")
    quit()

# Get the login session for OTHAdmin
session = requests.session()
session.post("https://www.fleaflicker.com/nhl/login", data={"email":Config.config["fleaflicker_email"], "password":Config.config["fleaflicker_password"], "keepMe":"true"})

# Get all of the league IDs
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip()) + 1 # Must be done AFTER adding the new leagues to the sql table
leagues = Shared.get_leagues_from_database(year, division[-1])

if len(leagues) == 0:
    print(f"No leagues found for year {year}")
    quit()

# print("Double check the text of the email below then comment out.")
# quit()

for league in leagues:
    league_id = league["id"]
    league_name = league["name"]

    standings = Shared.make_api_call(f"https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league_id}&season={year}")

    # Ensure the draft has been set
    if "draftLiveTimeEpochMilli" not in standings["league"]:
        print(f"Draft time not set for {league_name} ({league_id}). Please set it and re-run.")
        quit()

    # Get the list of managers already in the league
    already_registered = []
    if "teams" in standings["divisions"][0]:
        for team in standings["divisions"][0]["teams"]:
            if "owners" in team:
                already_registered.append(team["owners"][0]["id"])

    # Get the email addresses for this league from the registration spreadsheet
    emails = []
    sheets_service = Emailer.get_sheets_service()
    sheets = sheets_service.spreadsheets()
    rows = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="Responses!A:W").execute()
    values = rows.get("values", [])

    EMAIL_ADDRESS_COL = 0 # A
    FF_ID_COL = 2 # C
    LEAGUE_ASSIGN_COL = 22 # W
    for row in values[1:]:
        # Skip managers not assigned to a league yet
        if len(row) <= LEAGUE_ASSIGN_COL:
            continue

        # Skip managers assigned to other leagues
        if row[LEAGUE_ASSIGN_COL].lower().strip() != league_name.lower():
            continue

        # Skip managers already registered
        if int(row[FF_ID_COL]) in already_registered:
            continue

        emails.append(row[EMAIL_ADDRESS_COL])

    invite_message_data = {
        "emails": ",".join(emails),
        "from": "OTHAdmin",
    }

    # Skip inviting if there's no new managers in this league
    if len(emails) == 0:
        print(f"No invites to send for {league_name}.")
        continue

    # Invite to league
    print(f"{len(emails)} invites to send for {league_name}.")
    if not DEBUG:
        session.post("https://www.fleaflicker.com/nhl/leagues/{}/invite".format(league_id), invite_message_data)
    else:
        print("Actual invites not sent -- set DEBUG to false to proceed.")

    all_emails.extend(emails)

# Construct the email
to = "roldtimehockey@gmail.com"
subject = "OldTimeHockey Invite"
body = \
"Hello -- \n\n" + \
"You are receiving this email because you registered for the Old Time Hockey fantasy league this year. " + \
"We have sent invites via fleaflicker and you should have one to this address. Please check your Spam and Promotions folders. " + \
"If you can't find it, reach out to an admin via Discord or respond to this email. \n\n" + \
"Once you click the link, click TAKE OVER on any open team in that league and feel free to change the name and logo. " + \
"Draft order is NOT finalized and will be randomized after the league fills.\n\n" + \
"Join our discord to stay more involved: https://discord.com/invite/zXTUtj9\n\n" + \
"-- Admins"

# Add the admins to ensure this gets sent
all_emails.extend(Config.config["admin_email_ccs"].split(","))

gmail_service = Emailer.get_gmail_service()

print(f"Sending {len(all_emails)} emails to {all_emails}.")
if not DEBUG and send_emails:
    bcc = ",".join(all_emails)
    Emailer.send_message(gmail_service, subject, body, to, None, bcc)
else:
    print("Emails not sent. Edit script to enable.")
