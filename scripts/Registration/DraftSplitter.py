# Standard Python libaries
import sys

# My libraries
sys.path.insert(0, "../Emailer")
import Emailer

# IDs for this year's and last year's google sheets
reg_sheet_2022_2023 = "1cJJROoZII06bjaYUfU6IITPrpPM_bKkN0nIsXcv7iFQ"

# Get the registration spreadsheets
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=reg_sheet_2022_2023, range="B:I").execute()

# Get all of last year's registrants
values = rows.get("values", [])
division_drafts = {"D1":{}, "D2":{}, "D3":{}, "D4":{}}
users = {}
for row in values[1:]:
    # Extract values
    email = row[0]
    user = row[1]
    user_id = row[2]
    division = row[6]
    drafts = row[7].split(" EST, ")
    drafts[-1] = drafts[-1][:-4] # trim the last one

    # Populate maps
    users[user_id] = {"email":email, "user":user, "division":division, "drafts":drafts}
    for draft in drafts:
        if draft not in division_drafts[division]:
            division_drafts[division][draft] = []
        division_drafts[division][draft].append(user_id)

print(division_drafts)
