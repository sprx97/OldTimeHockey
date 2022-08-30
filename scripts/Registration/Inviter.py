# Python includes
import requests
import sys

# OTH includes
sys.path.insert(0, "/var/www/OldTimeHockey/scripts")
import Config
import Shared
sys.path.insert(0, "/var/www/OldTimeHockey/scripts/Emailer")
import Emailer

# Get the login session for OTHAdmin
session = requests.session()
session.post("https://www.fleaflicker.com/nhl/login", data={"email":Config.config["fleaflicker_email"], "password":Config.config["fleaflicker_password"], "keepMe":"true"})

# Get all of the league IDs
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
leagues = Shared.get_leagues_from_database(year)

invite_url = "https://www.fleaflicker.com/nhl/leagues/{}}/invite"
for league in leagues:
    league_id = league["id"]
    league_name = league["name"]

    # Get emails from ghseets and use to populate the emails field
    # If possible don't send them to teams that have already joined
    #   https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id=12086&season=2022
    #   result["divisions"][0]["teams"][n]["owners"] does not exist
    #   result["divisions"][0]["teams"][n]["owners"][0]["id"] matches the FFid

    # Get the list of managers already in the league
    already_registered = []
    standings = Shared.make_api_call(f"https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league_id}&season={year+1}")
    for team in standings["divisions"][0]["teams"]:
        if "owners" in team:
            already_registered.append(team["owners"][0]["id"])

    # Get the email addresses for this league from the registration spreadsheet
    emails = []
    reg_sheet_2022_2023 = "1cJJROoZII06bjaYUfU6IITPrpPM_bKkN0nIsXcv7iFQ" # TODO: Move to Config file (or other shared location)
    sheets_service = Emailer.get_sheets_service()
    sheets = sheets_service.spreadsheets()
    rows = sheets.values().get(spreadsheetId=reg_sheet_2022_2023, range="B:M").execute()
    values = rows.get("values", [])

    EMAIL_ADDRESS_COL = 0
    FF_ID_COL = 2
    LEAGUE_ASSIGN_COL = 11
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

    print(emails)
    quit()

    invite_message_data = {
        "emails": ",".join(emails),
        "from": "OTHAdmin",
    }

    # Invite to league
    print(f"Inviting to {name}")
#    session.post(invite_url.format(id), invite_message_data)
