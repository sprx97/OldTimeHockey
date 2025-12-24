import os
import pymysql # sql queries
import requests
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ./../
from shared import Shared
from shared import Config

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()

cursor.execute("SELECT * from Leagues")
leagues = cursor.fetchall()
for league in leagues:
    response = requests.get("http://www.fleaflicker.com/api/FetchLeagueDraftBoard?league_id=" + str(league[0]) + "&season=" + str(league[1]) + "&sport=NHL")
    draft_order = response.json()["draftOrder"]

    for pick_num in range(len(draft_order)):
        id = draft_order[pick_num]["id"]
        cursor.execute(f"UPDATE Teams set DraftPosition={pick_num + 1} where teamID={id}")

db.commit()
