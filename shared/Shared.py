# Python Libraries
import json
import os
import pymysql
import requests
import sys

# Local Includes
sys.path.append(os.path.dirname(os.path.realpath(__file__))) # ./
import Config

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

# Gets the JSON data from the given fleaflicker.com/api call
def make_api_call(link):
    try:
        with requests.get(link) as response: # Throws HTTPError if page fails to open
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
