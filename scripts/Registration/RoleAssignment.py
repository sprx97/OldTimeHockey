# Python includes
import os
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import Config
from Emailer import Emailer

# Get all the registrants from the sheet
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()
rows = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="A:N").execute()
values = rows.get("values", [])

# Open the output file
f = open(Config.config["roles_file_out_location"], "w")

DISCORD_NAME_COL = 4 # E
DIV_ASSIGN_COL = 12 # M
LEAGUE_ASSIGN_COL = 13 # N
for row in values[1:]:
    # Skip managers not assigned to a league yet
    if len(row) <= LEAGUE_ASSIGN_COL:
        continue

    # Skip managers without a discord account
    if row[DISCORD_NAME_COL] == "":
        continue

    name, discrim = row[DISCORD_NAME_COL].split("#")
    name = name.strip()
    discrim = discrim.strip()

    out_line = f"{name}\t{discrim}\t{row[DIV_ASSIGN_COL]}\t{row[LEAGUE_ASSIGN_COL]}\n"
    f.write(out_line)

f.close()
