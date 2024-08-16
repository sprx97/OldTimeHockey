# Standard python libraries
import datetime
import os
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared.Shared import *
from shared.Emailer import Emailer

DEBUG = False

# Failsafe 1
print("Are you sure you want to run the registraton script? This will email more than 200 people. (yes/no)")
confirm = input()
if confirm != "yes":
    print("Aborting.")
    quit()

# Failsafe 2
d = datetime.datetime.now()
month = int(d.strftime("%m"))
if month >= 10 or month <= 6:
    print ("Why are we sending regisration pings during the season? Please be sure you want to do this.")
    quit()

# Get the registration spreadsheets
sheets_service = Emailer.get_sheets_service()
sheets = sheets_service.spreadsheets()

last_year = sheets.values().get(spreadsheetId=Config.config["prev_season_reg_sheet_id"], range="B:B").execute()
this_year = sheets.values().get(spreadsheetId=Config.config["this_season_reg_sheet_id"], range="B:B").execute()
retirees = ["joanna.teng14@gmail.com", "baseballstuff@tutanota.com", "rdknott@gmail.com"]

# Get all of last year's registrants
values = last_year.get("values", [])
emails = []
for row in values[1:]: # Skip the header
    emails.append(row[0].strip().lower())

# Remove the ones who have already registered this year
values = this_year.get("values", [])
for row in values[1:]: # Skip the header
    email = row[0].strip().lower()
    if email in emails:
        emails.remove(email)

# Remove the retirees
for email in retirees:
    if email in emails:
        emails.remove(email)

print("Remember to update the subject and body, and any retirees, then uncomment these lines.")
quit()

# Construct the email -- TODO Update the form link each offseason
to = "roldtimehockey@gmail.com"
subject = "Old Time Hockey 2024-25 Registration"
body = "Hello -- \n\n" + \
"You are receiving this email because you played in the Old Time Hockey fantasy league last year. " + \
"If you are interested in playing again, the registration form can be found here: https://forms.gle/DAn53vF5JTsU1W8L6\n\n" + \
"The deadline to register and keep your slot is Tuesday 9/24 at 9am PST. After that you can still register but you are no longer guaranteed a spot.\n\n" + \
"Drafts this year will take place between September 27th and September 30th. Hope to see you back!\n\n" + \
"-- Admins"

gmail_service = Emailer.get_gmail_service()

NUM_PER_SLICE = 97 # 97 emails plus two admins in the bcc, and this account in the to line equals 100, the gmail API sending limit
for n in range(0, len(emails), NUM_PER_SLICE):
    emails_slice = emails[n:n+NUM_PER_SLICE]

    # Add the admins to ensure this gets sent
    emails_slice.extend(Config.config["admin_email_ccs"].split(","))

    # Failsafe 3
    print(f"{subject}\n{body}\n")
    print(f"{len(emails_slice)} {emails_slice}\n")
    if DEBUG:
        print("Stopped before sending. Set the DEBUG flag to False to send.\n")
        continue

    # Send the email
    bcc = ",".join(emails_slice)
    Emailer.send_message(gmail_service, subject, body, to, None, bcc)
