# Python includes
import os
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Config
from shared.Emailer import Emailer

# Get all the registrants from the sheet
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="Responses!A:Y").execute()
values = rows.get("values", [])

# Open the output file
f = open(Config.config["roles_file_out_location"], "w")

DISCORD_NAME_COL = 3 # D
DIV_ASSIGN_COL = 23 # X
LEAGUE_ASSIGN_COL = 24 # Y
for row in values[1:]:
    # Skip managers not assigned to a league yet
    if len(row) <= LEAGUE_ASSIGN_COL or row[LEAGUE_ASSIGN_COL] == "WAITLIST": # or row[DIV_ASSIGN_COL] == "D1" or row[DIV_ASSIGN_COL] == "D3" or row[DIV_ASSIGN_COL] == "D4" or row[DIV_ASSIGN_COL] == "NEW":
        continue

    # Skip managers without a discord account
    if row[DISCORD_NAME_COL] == "":
        continue

    name = row[DISCORD_NAME_COL]
    name = name.strip()

    if row[DIV_ASSIGN_COL] == "NEW":
        row[DIV_ASSIGN_COL] = "D4"

    out_line = f"{name}\t{row[DIV_ASSIGN_COL]}\t{row[LEAGUE_ASSIGN_COL]}\n"
    f.write(out_line)

f.close()
