# Standard python libraries
from datetime import datetime
import os
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared.Shared import *
from shared.Emailer import Emailer

DEBUG = True

print("Remember to update the below variables, then comment out these lines.")
quit()

year = 2026
reg_form_link = "https://forms.gle/mGznBPwf4KQVPBtt8"
draft_dates = "September 25th-28th"
registration_deadline = f"September 8th, {year} at 9am EST"
reminder_num = "LAST CALL"
retirees = [2227203, 1382557, 2109426, 2267437, 1357398, 654680, 2102614, 664513, 2210964] # See Retirements list in Checkin tab of sheet

# Failsafe 1
print("Are you sure you want to run the registraton reminder script? This could email more than 200 people. (yes/no)")
confirm = input()
if confirm != "yes":
    print("Aborting.")
    quit()

# Failsafe 2
d = datetime.now()
month = int(d.strftime("%m"))
if month >= 10 or month <= 6:
    print ("Why are we sending regisration pings during the season? Please be sure you want to do this.")
    quit()

# Get the registration spreadsheets
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()

last_year = sheets.values().get(spreadsheetId=Config.config["reg_sheet_id"], range=f"{year-1}-{year}!A:X").execute()
this_year = sheets.values().get(spreadsheetId=Config.config["reg_sheet_id"], range="Responses!A:W").execute()

# Get all of last year's registrants
values = last_year.get("values", [])
emails = {}
for row in values[1:]: # Skip the header
    if row == []:
        break
    if row[23] == "DECLINED" or row[23] == "NO RESPONSE" or row[23] == "REJECTED" or row[23] == "QUITTER":
        print(f"Skipping manager who didn't play or quit last year: {row[1]}")
        continue
    ff_id = row[3].strip()
    if ff_id != "":
        emails[int(ff_id)] = row[1].strip().lower()

# Remove the ones who have already registered this year
values = this_year.get("values", [])
for row in values[1:]: # Skip the header
    if row == []:
        break
    email = row[0].strip().lower()
    ff_id = row[2].strip()
    if ff_id != "":
        ff_id = int(ff_id)
        if ff_id in emails.keys() or email in emails.values():
            del emails[ff_id]

# Remove the retirees
for ff_id in retirees:
    if ff_id in emails.keys():
        del emails[ff_id]

to = "roldtimehockey@gmail.com"
subject = f"Old Time Hockey {year} Registration ({reminder_num})"
body = "Hello -- \n\n" + \
"You are receiving this email because you played in the Old Time Hockey fantasy league last year or were on our waitlist. " + \
f"If you are interested in playing this year, the registration form can be found here: {reg_form_link}\n\n" + \
f"The registration deadline to keep your spot is {registration_deadline}. " + \
f"Drafts this year will take place {draft_dates}. Hope to see you back!\n\n" + \
f"If you do not register this season you will be removed from this list, so no further action required.\n\n" + \
"-- Admins"

gmail_service = Emailer.get_gmail_service()

print(f"{subject}\n{body}\n")

NUM_PER_SLICE = 97 # 97 emails plus two admins in the bcc, and this account in the to line equals 100, the gmail API sending limit
for n in range(0, len(emails), NUM_PER_SLICE):
    emails_slice = list(emails.values())[n:n+NUM_PER_SLICE]

    # Add the admins to ensure this gets sent
    emails_slice.extend(Config.config["admin_email_ccs"].split(","))

    # Failsafe 3
    print(f"{len(emails_slice)} {emails_slice}\n")
    if DEBUG:
        print("Stopped before sending. Set the DEBUG flag to False to send.\n")
        continue

    # Send the email
    bcc = ",".join(emails_slice)
    Emailer.send_message(gmail_service, subject, body, to, None, bcc)
