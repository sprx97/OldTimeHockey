# Python Libraries
import pymysql
import requests

# Local Includes
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
    elif year == 2022:
        return week > 22
    else:
        return week > 23

# Grabs the list of OTH leagues for the given year
# from the SQL database
def get_leagues_from_database(year, tier=None):
    DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
    cursor = DB.cursor()
    query = f"SELECT id, name, year from Leagues where year={year}"
    if tier != None:
        query += " and tier=" + str(tier)
    cursor.execute(query)
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
