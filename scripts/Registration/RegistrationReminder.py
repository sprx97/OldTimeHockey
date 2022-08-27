# Standard python libraries
import datetime

# My libraries
import GoogleHelpers

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

# Create bcc list from all emails in last year's sheet but NOT this year's sheet
# Hard-code email body
# Send Message

# IDs for this year's and last year's google sheets
reg_sheet_2021_2022 = "1jC3zHsRuB6IawR-AM5ZtAOl360pCdjqUk230NiWPYbo"
reg_sheet_2022_2023 = "1cJJROoZII06bjaYUfU6IITPrpPM_bKkN0nIsXcv7iFQ"

# Get the registration spreadsheets
sheets_service = GoogleHelpers.get_sheets_service()
sheets = sheets_service.spreadsheets()
last_year = sheets.values().get(spreadsheetId=reg_sheet_2021_2022, range="B:B").execute()
this_year = sheets.values().get(spreadsheetId=reg_sheet_2022_2023, range="B:B").execute()

# Get all of last year's registrants
values = last_year.get("values", [])
emails = []
for row in values:
    emails.append(row[0].strip())

# Remove the ones who have already registered this year
values = this_year.get("values", [])
for row in values:
    email = row[0].strip()
    if email in emails:
        emails.remove(email)

# Construct the email
to = "roldtimehockey@gmail.com"
subject = "Old Time Hockey 2022-23 Registration"
body = \
"Hello -- \n\n" + \
"You are receiving this email because you played in the Old Time Hockey fantasy league last year. " + \
"If you are interested in playing again, the registration form can be found here: https://forms.gle/V8VBqUVKe1kMJM6C6\n\n" + \
"Drafts this year will take place between September 29th and October 3rd. Hope to see you back!\n\n" + \
"-- Admins"

gmail_service = GoogleHelpers.get_gmail_service()

# Slice into chunks of < 100 to send -- that's the gmail API limit
for n in range(0, len(emails), 90):
    emails_slice = emails[n:n+90]

    # Add the admins to ensure this gets sent
    emails_slice.append("jeremy.vercillo@gmail.com")
    emails_slice.append("morgan.t.adams.fromer@gmail.com")

    # Failsafe 3
#    print("Stopped before sending. Comment out the failsafe lines to continue.")
#    print(emails_slice)
#    continue

    # Send the email
    bcc = ",".join(emails_slice)
    GoogleHelpers.send_message(gmail_service, subject, body, to, None, bcc)
