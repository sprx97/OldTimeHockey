import os

# --login-path=cronjob was set via mysql_config_editor and includes host=localhost and the same username and password from our config file
os.system("mysqldump --login-path=cronjob --single-transaction OldTimeHockey Leagues Teams Teams_post Users > /var/www/OldTimeHockey/oth.sql")
os.system("cp /etc/crontab /var/www/OldTimeHockey/crontab")
os.system("cd /var/www/OldTimeHockey")
os.system("git commit -a -m 'Updated database dump'")
