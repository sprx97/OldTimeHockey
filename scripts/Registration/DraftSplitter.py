# Standard Python libaries
import sys

# My libraries
sys.path.insert(0, "/var/www/OldTimeHockey/scripts")
import Config
sys.path.insert(0, "/var/www/OldTimeHockey/scripts/Emailer")
import Emailer

# IDs for this year's google sheet
reg_sheet_2022_2023 = "1cJJROoZII06bjaYUfU6IITPrpPM_bKkN0nIsXcv7iFQ"

# Get the registration spreadsheets
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="B:I").execute()

# Get all of last year's registrants
values = rows.get("values", [])
division_drafts = {"D1":{}, "D2":{}, "D3":{}, "D4":{}}
division_users = {"D1":{}, "D2":{}, "D3":{}, "D4":{}}
for row in values[1:]:
    # Extract values
    email = row[0]
    user = row[1]
    user_id = row[2]
    division = row[6]
    drafts = row[7].split(" EST, ")
    drafts[-1] = drafts[-1][:-4] # trim the last one

    # Populate maps
    division_users[division][user_id] = {"email":email, "user":user, "drafts":drafts}
    for draft in drafts:
        if draft not in division_drafts[division]:
            division_drafts[division][draft] = []
        division_drafts[division][draft].append(user_id)

# Manually modify as needed
div = "D2"
num_leagues = 3

# Display the number of people who can make each different draft time
draft_times = division_drafts[div]
for time in draft_times:
    print(time, len(draft_times[time]))

# Display the number of draft times each user can make
division_users[div] = dict(sorted(division_users[div].items(), key=lambda user:len(user[1]["drafts"])))
for user_id in division_users[div]:
    user = division_users[div][user_id]
    print(user_id, len(user["drafts"]))
