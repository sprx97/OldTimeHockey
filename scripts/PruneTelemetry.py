# Python Includes
import os
import pymysql # sql queries
import sys

# OTH includes
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) # ./../
from shared.Shared import *
from shared import Config

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"], cursorclass=pymysql.cursors.DictCursor)
cursor = db.cursor()

TELEM_RETAIN_DAYS = 90
cursor.execute("DELETE FROM ApiUsageTelemetry WHERE time_bucket < NOW() - INTERVAL %s DAY", (TELEM_RETAIN_DAYS,))

db.commit()
