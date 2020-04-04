import Config
import os

os.system("mysqldump OldTimeHockey > ../oth.sql -u " + Config.config["sql_username"] + " -p" + Config.config["sql_password"] + " --single-transaction")
os.system("cp /etc/crontab ../crontab")
