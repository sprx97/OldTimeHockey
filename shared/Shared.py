# Python Libraries
from datetime import datetime
import json
import os
import pymysql
import requests
import sys
import time
from urllib.parse import urlparse

# Local Includes
sys.path.append(os.path.dirname(os.path.realpath(__file__))) # ./
import Config

# The week playoffs start varies year to year. It's easiest to just add it manually each year here.
def is_playoff_week(week, year):
    if year == 2012:
        return week > 10
    elif year == 2013:
        return week > 20
    elif year == 2020:
        return week > 13
    elif year == 2021:
        return week > 25
    elif year == 2022 or year == 2023:
        return week > 22
    else:
        return week > 23

# We ignored consolation brackets until 2025, but starting then they get tracked separately.
def should_use_consolation_bracket(year):
    return year >= 2025

# Grabs the list of OTH leagues for the given year
# from the SQL database
def get_leagues_from_database(year, tier=None):
    DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
    cursor = DB.cursor()
    query = "SELECT id, name, year from Leagues where year=%s"
    params = [year]
    if tier != None:
        query += " and tier=%s"
        params.append(tier)
    cursor.execute(query, tuple(params))
    leagues = cursor.fetchall()
    cursor.close()

    return leagues

def bucket_time(minutes):
    dt = datetime.now()
    bucket_minute = (dt.minute // minutes) * minutes
    return dt.replace(minute=bucket_minute, second=0, microsecond=0)

telemetry = {}
def log_api_usage_telemetry(site):
    if site not in telemetry:
        telemetry[site] = {}

    bucket = bucket_time(minutes=1).strftime("%Y-%m-%d %H:%M:%S")
    if bucket not in telemetry[site]:
        telemetry[site][bucket] = 0

    telemetry[site][bucket] += 1

def flush_telemetry():
    global telemetry
    DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
    cursor = DB.cursor()

    query = "INSERT INTO ApiUsageTelemetry (time_bucket, site, count) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE count = count + VALUES(count)"

    for site, buckets in telemetry.items():
        for bucket, count in buckets.items():
            cursor.execute(query, (bucket, site, count))

    DB.commit()
    cursor.close()
    DB.close()

    telemetry = {}

# Gets the JSON data from the given fleaflicker.com/api call
headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
}
def make_api_call(link):
    # Log telemetry to ensure I'm not overusing APIs
    if "://" not in link:
        link = "https://" + link
    site = urlparse(link).netloc.replace("www.", "")
    log_api_usage_telemetry(site)

    try:
        with requests.get(link, headers=headers) as response: # Throws HTTPError if page fails to open
            if response.status_code == 429 or response.status_code == 403:
                print(f"Rate limited when accessing {link}. Retrying in 60 seconds...")
                time.sleep(60)
                response = requests.get(link, headers=headers)
            data = response.json()
    except requests.exceptions.HTTPError:
        print(f"Error accessing {link}")
        return {}

    return data

# TODO: This differs from the other Shared.py but is better
def WriteJsonFile(file, data):
    file = f"{Config.config['srcroot']}{file}"
    try:
        directory = "/".join(file.split("/")[:-1])
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Made new directory {directory}")

        # TODO: This differs from the other Shared.py version in that Config.config['srcroot'] has a trailing slash
        with open(file, "w") as f:
            json.dump(data, f, indent=4)

    except Exception as e:
        print(f"Error writing to {file}. {e}")
