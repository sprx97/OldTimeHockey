# Standard Python libaries
import copy
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
if division != "D2" and division != "D3" and division != "D4":
    print("Division must be D2, D3, or D4.")
    quit()

# Get the registration spreadsheets
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="B:I").execute()

# Get all of last year's registrants
values = rows.get("values", [])
all_draft_times = {}
all_users = {}
for row in values[1:]:
    # Only look for the chosen division
    if row[6] != division:
        continue

    # Extract values
    email = row[0]
    user = row[1]
    user_id = row[2]
    drafts = row[7].split(" EST, ")
    drafts[-1] = drafts[-1][:-4] # trim the last one

    # Assign data to our maps of user->drafs and drafts->num_users
    all_users[user_id] = {"email":email, "user":user, "drafts":drafts}
    for draft in drafts:
        if draft not in all_draft_times:
            all_draft_times[draft] = []
        all_draft_times[draft].append(user_id)

num_leagues = math.ceil(len(all_users) / NUM_TEAMS_PER_LEAGUE)

# Find all possible combinations of draft slots
draft_combinations = list(combinations(all_draft_times.keys(), num_leagues))
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
ranked_combinations = dict(sorted(ranked_combinations.items(), key=lambda item:item[1], reverse=True))

# Try out the first ten combinations
for combo, ranking in list(ranked_combinations.items())[:20]:
    user_drafts = {}
    for id in all_users:
        user_drafts[id] = []
        for draft in combo:
            if draft in all_users[id]["drafts"]:
                user_drafts[id].append(draft)
    
    user_drafts = dict(sorted(user_drafts.items(), key=lambda item:len(item[1])))
    print(ranking, combo)

    # Create empty leagues
    leagues = {}
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
        if best_draft == None:
            print(f"Could not assign user {id}")
        else:
            leagues[best_draft].append(id)

    num_successfully_assigned = 0
    for draft in leagues:
        users = leagues[draft]
        num_successfully_assigned += len(leagues[draft])
        print(len(users), draft, users)
        
    print(num_successfully_assigned, "\n")


##################################################################################################################
# # Remove all drafts that don't work for at least NUM_TEAMS_PER_LEAGUE people
# valid_draft_times = {}
# for draft in draft_times:
#     if len(draft_times[draft]) >= NUM_TEAMS_PER_LEAGUE:
#         valid_draft_times[draft] = draft_times[draft]
# draft_times = valid_draft_times

# # Remove invalid draft times from each user to optimize
# for id in users:
#     for draft in users[id]["drafts"]:
#         if draft not in draft_times:
#             users[id]["drafts"].remove(draft)

# # sort by least-flexible users
# users = dict(sorted(users.items(), key=lambda user:len(user[1]["drafts"])))
# for user in users:
#     print(user, len(users[user]["drafts"]))
# quit()

# possible_solutions = []
# # Recursive method to find the best possible draft times and league assignments
# def assign_next(remaining_users, remaining_draft_times, league_assignments):
#     if len(remaining_users) == 0:
#         possible_solutions.append(copy.deepcopy(league_assignments))
#         for draft_time in league_assignments:
#             print(draft_time)
#             for user in league_assignments[draft_time]:
#                 print("\t", user)

#         return

#     # Grab the next user from the queue
#     next_user_id = list(remaining_users.keys())[0]
#     next_user = remaining_users.pop(next_user_id)

#     # Update remaining draft times with this user removed
#     drafts = next_user["drafts"]
#     for draft in drafts:
#         remaining_draft_times[draft].remove(next_user_id)

#     # Sort the user's drafts by most popular choice
#     # Try to pick the most-popular ones early on, and the least-popular ones later
#     drafts = sorted(drafts, key=lambda draft:len(remaining_draft_times[draft]), reverse=(len(league_assignments) == num_leagues))

#     for draft in drafts:
#         # If the number of leagues is maxed and this draft is not one of them, skip it
#         if draft not in league_assignments and len(league_assignments) == num_leagues:
#             drafts.remove(draft)
#             continue

#         # If there is a league with the draft at this time and it's full, continue
#         if draft in league_assignments and len(league_assignments[draft]) == NUM_TEAMS_PER_LEAGUE:
#             drafts.remove(draft)
#             continue

#         # If there is a league with the draft at this time and it's open, assign the user and move on
#         if draft in league_assignments:
#             league_assignments[draft].append(next_user_id)
#             assign_next(copy.deepcopy(remaining_users), copy.deepcopy(remaining_draft_times), copy.deepcopy(league_assignments))
#             league_assignments[draft].remove(next_user_id)

#             drafts.remove(draft)
#             continue

#     # If there's room to add another league, make one using that draft time
#     if len(league_assignments) < num_leagues:
#         for draft in drafts:
#             league_assignments[draft] = [next_user_id]
#             assign_next(copy.deepcopy(remaining_users), copy.deepcopy(remaining_draft_times), copy.deepcopy(league_assignments))
#             league_assignments.pop(draft)

#             drafts.remove(draft)

# league_assignments = {}
# while not assign_next(copy.deepcopy(users), copy.deepcopy(draft_times), copy.deepcopy(league_assignments)):
#     print(len(possible_solutions))

#     if len(users) == 0:
#         assert False, "Problem may be unsolvable"

#     # Remove the least flexible user before trying again
#     next_user_id = list(users.keys())[0]
#     next_user = users.pop(next_user_id)

#     print(f"User {next_user_id} removed.")
