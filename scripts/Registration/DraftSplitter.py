# Standard Python libaries
import itertools
import math
import os
import random
import sys

# Import our config file
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Config
from shared.Emailer import Emailer

NUM_TEAMS_PER_LEAGUE = 14
NUM_SPACER_ROWS = 3

if len(sys.argv) != 3:
    print("Please provide a division (D2-D5) and a star threshold (1-5).")
    quit()

division = sys.argv[1]
if division not in ["D2", "D3", "D4", "D5"]:
    print("Division must be D2, D3, D4, or D5.")
    quit()

star_threshold = sys.argv[2]
if star_threshold not in ["2", "3", "4", "5"]:
    print("Star threshold must be between 2 and 5.")
    quit()
star_threshold = int(star_threshold)   

# Get the registration spreadsheet
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=Config.config["reg_sheet_id"], range="Responses!A:W").execute()

# Get the ELO for each owner so every draft slot can be sorted before it is written.
elo_rows = sheets.values().get(spreadsheetId=Config.config["reg_sheet_id"], range="ELO!B2:C").execute()
elo_by_name = {}
for row in elo_rows.get("values", []):
    if len(row) < 2 or row[0] == "" or row[1] == "":
        continue

    try:
        elo_by_name[row[0].lower()] = float(row[1].replace(",", ""))
    except (AttributeError, ValueError):
        print(f"Could not parse ELO '{row[1]}' for {row[0]}.")

# Get all of this year's registrants
values = rows.get("values", [])
values = values[1:] # Chop off the header row

all_draft_times = {}
all_users = {}
max_in_division = 70 if division == "D5" else 56 if division == "D4" else 42 if division == "D3" else 28 # if division == "D2"
count = 0
for row in values:
    # Only look for the chosen division, but count NEW as D5
    if row[21] != division and not (row[21] == "NEW" and division == "D5"):
        continue

    # Skip the waitlist -- the bottom of the reg form without a division
    if len(row) == 23 and row[22] == "WAITLIST":
        continue

    # Extract values
    email = row[0]
    user_name = row[20]
    user_id = row[2]

    temp_threshold = 5
    drafts = []
    while len(drafts) == 0 or temp_threshold >= star_threshold:
        more_drafts = row[20-temp_threshold].split(" EST, ")
        more_drafts[-1] = more_drafts[-1][:-4] # trim the last one
        if more_drafts[0] != "":
            drafts.extend(more_drafts)

        temp_threshold -= 1
        if temp_threshold == 1:
            break

    if len(drafts) == 0:
        print(f"User {user_name} is being difficult.")

    if user_id in all_users:
        print(f"User {user_name} has duplicate entry.")

    # Assign data to our maps of user->drafts and drafts->num_users
    all_users[user_id] = {"email":email, "name":user_name, "drafts":drafts}
    for draft in drafts:
        if draft not in all_draft_times:
            all_draft_times[draft] = []
        all_draft_times[draft].append(user_id)

    count += 1
    if count == max_in_division:
        break

num_leagues = math.ceil(len(all_users) / NUM_TEAMS_PER_LEAGUE)

# TODO: Potentially randomize the order of all_draft_times[N] to get different results each time?

# Find all possible combinations of draft slots
draft_combinations = list(itertools.combinations(all_draft_times.keys(), num_leagues))
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

    # The second sort parameter, random.randrange, is so we get different possibilities every time we run the script
    user_drafts = dict(sorted(user_drafts.items(), key=lambda item:(len(item[1]), random.randrange(100))))

    # Create empty leagues
    leagues = {"UNASSIGNED":[]}
    for draft in combo:
        leagues[draft] = []

    # Assign each user to the emptiest draft, going for least flexible user to most
    for id in user_drafts:
        best_draft = None
        for draft in user_drafts[id]:
            league_size = len(leagues[draft])
            if league_size >= NUM_TEAMS_PER_LEAGUE:
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

# Sort by day of week
sorted_combinations = []
for combo in best_combinations:
    def sortfunc(item):
        if item[0] == "UNASSIGNED":
            return "UNASSIGNED"
        
        return "".join(item[0].split(" ")[1:]) # Trim off the day of week, and then just compare the strings

    sorted_combinations.append(dict(sorted(combo.items(), key=sortfunc)))
best_combinations = sorted_combinations

def get_elo_sort_key(user_name):
    normalized_name = user_name.lower()
    elo = elo_by_name.get(normalized_name)
    return (elo is None, -elo if elo is not None else math.inf, normalized_name)

def get_column_name(column_index):
    column_name = ""
    while column_index >= 0:
        column_name = chr(column_index % 26 + ord("A")) + column_name
        column_index = column_index // 26 - 1
    return column_name

def get_sheet_values(combo, start_row):
    draft_columns = []
    for draft_time, users in combo.items():
        sorted_users = sorted(users, key=get_elo_sort_key)
        draft_columns.append((draft_time, sorted_users))

    values = []
    header = []
    for draft_time, users in draft_columns:
        header.extend([draft_time, ""])
    values.append(header)

    num_user_rows = max((len(users) for draft_time, users in draft_columns), default=0)
    for user_index in range(num_user_rows):
        row = []
        sheet_row = start_row + user_index + 1
        for draft_index, (draft_time, users) in enumerate(draft_columns):
            user_name = users[user_index] if user_index < len(users) else ""
            row.append(user_name)
            if user_name == "":
                row.append("")
                continue

            name_column = get_column_name(draft_index * 2)
            row.append(f"=INDEX(ELO!$C:$C, MATCH({name_column}{sheet_row}, ELO!$B:$B, 0))")
        values.append(row)

    return values

# "Print" the combinations to the spreadsheet
print("Post to spreadsheet (Y/N)?")
response = input()
if response == "Y":
    existing_rows = sheets.values().get(spreadsheetId=Config.config["reg_sheet_id"], range=f"{division} Drafts!A:Z").execute().get("values", [])
    start_sheet_row = len(existing_rows) + 1
    next_sheet_row = start_sheet_row
    values = []
    for combo in best_combinations:
        if len(values) > 0:
            num_columns = len(combo) * 2
            values.extend([[""] * num_columns for _ in range(NUM_SPACER_ROWS)])
            next_sheet_row += NUM_SPACER_ROWS

        combo_values = get_sheet_values(combo, next_sheet_row)
        values.extend(combo_values)
        next_sheet_row += len(combo_values)

    if len(values) > 0:
        result = sheets.values().update(spreadsheetId=Config.config["reg_sheet_id"], range=f"{division} Drafts!A{start_sheet_row}", valueInputOption="USER_ENTERED", body={"values": values}).execute()

# Print to console
for combo in best_combinations:
    for draft, users in combo.items():
        print(draft, len(users), users)
    print()