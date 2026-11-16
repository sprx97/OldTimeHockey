import os
import pymysql
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from shared import Config

def update_round_status(cursor, year, week, status):
    cursor.execute(
        """
        UPDATE OTHCupRounds AS r
        SET status = %s
        WHERE r.year = %s
          AND (r.first_week = %s OR r.second_week = %s)
          AND EXISTS (
              SELECT 1
              FROM OTHCupMatches AS m
              WHERE m.year = r.year
                AND m.stage = r.stage
                AND m.round = r.round_number
          )
        """,
        (status, year, week, week),
    )
    return cursor.rowcount

def main():
    week_vars_path = os.path.join(Config.config["website_srcroot"], "scripts", "WeekVars.txt")
    with open(week_vars_path, "r") as week_vars:
        year = int(week_vars.readline().strip())
        week = int(week_vars.readline().strip())

    db = pymysql.connect(
        host=Config.config["sql_hostname"],
        user=Config.config["sql_username"],
        passwd=Config.config["sql_password"],
        db=Config.config["sql_dbname"],
    )
    try:
        with db.cursor() as cursor:
            completed = update_round_status(cursor, year, week - 1, "completed") if week > 1 else 0
            in_progress = update_round_status(cursor, year, week, "in progress")
        db.commit()
        print(f"Updated {completed} OTH Cup rounds to completed and {in_progress} to in progress.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
