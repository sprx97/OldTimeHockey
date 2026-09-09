import os
import pymysql
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))) # ./../../
from shared import Config

with open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r") as week_vars:
    previous_year = int(week_vars.readline().strip())

current_year = previous_year + 1

query = """
    INSERT INTO Leagues (id, year, name, commish, tier)
    SELECT id, %s, name, commish, tier
    FROM Leagues
    WHERE year = %s
"""

db = pymysql.connect(
    host=Config.config["sql_hostname"],
    user=Config.config["sql_username"],
    passwd=Config.config["sql_password"],
    db=Config.config["sql_dbname"],
)

try:
    with db.cursor() as cursor:
        leagues_added = cursor.execute(query, (current_year, previous_year))
    db.commit()
    print(f"Added {leagues_added} leagues for {current_year}.")
except Exception:
    db.rollback()
    raise
finally:
    db.close()
