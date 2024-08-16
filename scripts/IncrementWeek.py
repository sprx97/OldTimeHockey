import os
import pymysql
import sys

# Import our config file
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ./../
from shared import Config

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()

week += 1
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "w")
f.write(str(year) + "\n")
f.write(str(week) + "\n")
f.close()

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor()
cursor.execute("UPDATE Teams SET PrevWeekPF=currentWeekPF")
db.commit()
