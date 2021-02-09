# Python Libraries
import json
import pymysql
import urllib.request

# Local Includes
import Config

# Grabs the list of OTH leagues for the given year
# from the SQL database
def get_leagues_from_database(year):
    DB = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
    cursor = DB.cursor()
    cursor.execute(f"SELECT id, name, year from Leagues where year={year}")
    leagues = cursor.fetchall()
    cursor.close()

    return leagues

# Gets the JSON data from the given fleaflicker.com/api call
def make_api_call(link):
    try:
        with urllib.request.urlopen(link) as url: # Throws HTTPError if page fails to open
            data = json.loads(url.read().decode())
    except urllib.request.HTTPError:
        print(f"Error accessing {link}")
        return {}

    return data
