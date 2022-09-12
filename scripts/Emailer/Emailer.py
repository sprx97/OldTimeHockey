from base64 import urlsafe_b64encode
from email.mime.text import MIMEText
import os
import sys

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import Config

def obtain_creds(file, scopes):
    creds = None
    file = Config.config["srcroot"] + "scripts/Emailer/tokens/" + file # Use special tokens directory

    # Read a stored credentials file if it exists
    if os.path.exists(file):
        creds = Credentials.from_authorized_user_file(file, scopes)

    # If there are no valid creds, let the user log in
    if not creds or not creds.valid:
        # Refresh expired, but existing, creds
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())

        # Otherwise create new creds from a login
        else:
            flow = InstalledAppFlow.from_client_secrets_file(Config.config["srcroot"] + "scripts/Emailer/auth.json", scopes)
            creds = flow.run_local_server(port=0)

        # Save creds for next run
        with open(file, "w") as token:
            token.write(creds.to_json())

    return creds

def get_gmail_service():
    creds = obtain_creds("gmail_token.json", ["https://www.googleapis.com/auth/gmail.send"])
    return build("gmail", "v1", credentials=creds)

def get_sheets_service():
    creds = obtain_creds("sheets_token.json", ["https://www.googleapis.com/auth/spreadsheets"])
    return build("sheets", "v4", credentials=creds)

def send_message(service, subject, body, to, cc=None, bcc=None):
    message = MIMEText(body)
    message["subject"] = subject
    message["from"] = Config.config["email_username"]

    message["to"] = to
    if cc:
        message["cc"] = cc
    if bcc:
        message["bcc"] = bcc

    message = {'raw': urlsafe_b64encode(message.as_bytes()).decode() }

    return service.users().messages().send(userId="me", body=message).execute()
