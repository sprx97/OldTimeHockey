# Standard Python libaries
from itertools import combinations
import math
import os
import sys

# My libraries
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import Config
from Emailer import Emailer

NUM_TEAMS_PER_LEAGUE = 14

if len(sys.argv) != 2:
    print("Please provide a division.")
    quit()

division = sys.argv[1]
if division not in ["D2", "D3", "D4"]:
    print("Division must be D2, D3, or D4.")
    quit()

# Get the registration spreadsheets
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="B:I").execute()

# Get all of last year's registrants
values = rows.get("values", [])
values = values[1:] # Chop off the header row

all_draft_times = {}
all_users = {}
max_in_division = 98 if division == "D4" else 70 if division == "D3" else 42
count = 0
for row in values:
    # Only look for the chosen division
    if row[6] != division:
        continue

    # Extract values
    email = row[0]
    user_name = row[1].strip()
    user_id = row[2]
    drafts = row[7].split(" EST, ")
    drafts[-1] = drafts[-1][:-4] # trim the last one

    # Assign data to our maps of user->drafs and drafts->num_users
    all_users[user_id] = {"email":email, "name":user_name, "drafts":drafts}
    for draft in drafts:
        if draft not in all_draft_times:
            all_draft_times[draft] = []
        all_draft_times[draft].append(user_id)

    count += 1
    if count == max_in_division:
        break

num_leagues = math.ceil(len(all_users) / NUM_TEAMS_PER_LEAGUE)

# # Duplicate the 3 most popular draft times
# all_draft_times = dict(sorted(all_draft_times.items(), key=lambda item:len(item[1]), reverse=True))
# draft_times_copy = copy.deepcopy(all_draft_times)
# for time, users in list(draft_times_copy.items())[:3]:
#     dupe_time = time + " (2)"
#     for user_id in users:
#         all_users[user_id]["drafts"].append(dupe_time)
#     all_draft_times[dupe_time] = users

# Find all possible combinations of draft slots
draft_combinations = list(combinations(all_draft_times.keys(), num_leagues))
print(len(draft_combinations), "total combinations.")
ranked_combinations = {}
for combo in draft_combinations:
    draft_users = {}
    for draft in combo:
        count = 0
        for id in all_users:
            if draft in all_users[id]["drafts"]:
                count += 1
        draft_users[draft] = count

    # Track the combined availibility for this combination
    ranked_combinations[combo] = sum(draft_users.values())

# Sort based on the most combined availability
def getNumZeroes(drafts):
    count = 0
    for id in all_users:
        found = False
        for draft in drafts:
            if draft in all_users[id]["drafts"]:
                found = True
                break
        if not found:
            count += 1

    return count
ranked_combinations = dict(sorted(ranked_combinations.items(), key=lambda item:getNumZeroes(item[0])))

best_combinations = []
best_num_assigned = 0

# for combo, ranking in list(ranked_combinations.items())[:10]:
#     print(ranking, getNumZeroes(combo), combo)

# Try out each combination
for combo, ranking in list(ranked_combinations.items()):
    # We're done if our best number assigned is greater than the non-zero users in this set
    # because we ordered our list by fewest number of zero-users
    if best_num_assigned > len(all_users)-getNumZeroes(combo):
        break

    user_drafts = {}
    for id in all_users:
        user_drafts[id] = []
        for draft in combo:
            if draft in all_users[id]["drafts"]:
                user_drafts[id].append(draft)

    user_drafts = dict(sorted(user_drafts.items(), key=lambda item:len(item[1])))

    # Create empty leagues
    leagues = {"UNASSIGNED":[]}
    for draft in combo:
        leagues[draft] = []

    # Assign each user to the emptiest draft, going for least flexible user to most
    for id in user_drafts:
        best_draft = None
        for draft in user_drafts[id]:
            league_size = len(leagues[draft])
            if league_size > NUM_TEAMS_PER_LEAGUE:
                continue
            elif best_draft == None:
                best_draft = draft
            elif league_size < len(leagues[best_draft]):
                best_draft = draft

        # Assign the user to their best match. In some cases we may not be able to do this
        if best_draft != None:
            leagues[best_draft].append(all_users[id]["name"])
        else:
            leagues["UNASSIGNED"].append(all_users[id]["name"])

    # Count the number of users successfully assigned to a league in this scenario
    num_successfully_assigned = 0
    for draft in leagues:
        if draft == "UNASSIGNED":
            continue
        users = leagues[draft]
        num_successfully_assigned += len(leagues[draft])

    # Compare this scenario to our current best(s)
    if num_successfully_assigned > best_num_assigned:
        best_combinations = [leagues]
        best_num_assigned = num_successfully_assigned
    elif num_successfully_assigned == best_num_assigned:
        best_combinations.append(leagues)

print(f"{best_num_assigned}/{len(all_users)} users assigned in {len(best_combinations)} different possibilities.")
if best_num_assigned != len(all_users):
    print("COULD NOT ASSIGN ALL USERS TO A DRAFT")

def transpose(list):
    result = []
    for i in range(NUM_TEAMS_PER_LEAGUE+1):
        row = []
        for item in list:
            try:
                row.append(item[i])
            except IndexError:
                row.append("")
        result.append(row)
    return result

# "Print" the combinations to the spreadsheet
print("Post to spreadsheet (Y/N)?")
response = input()
if response == "Y":
    for combo in best_combinations:
        values = []
        for draft_time, users in combo.items():
            row = []
            row.append(draft_time)
            row.extend(users)
            values.append(row)

        values = transpose(values)

        result = sheets.values().append(spreadsheetId=Config.config["this_season_reg_sheet_id"], range=f"{division}!A1", valueInputOption="RAW", body={"values": values}).execute()

# Print to console
for combo in best_combinations:
    for draft, users in combo.items():
        print(draft, users)
    print()