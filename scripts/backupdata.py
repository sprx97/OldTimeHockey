import Config
import os

os.system("mysqldump OldTimeHockey Leagues Teams Teams_post Users > /var/www/OldTimeHockey/oth.sql -u " + Config.config["sql_username"] + " -p" + Config.config["sql_password"] + " --single-transaction")
os.system("cp /etc/crontab /var/www/OldTimeHockey/crontab")
os.system("git commit -a -m 'Updated database dump'")
