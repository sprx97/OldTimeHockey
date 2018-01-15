import MySQLdb

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()

week += 1
f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "w")
f.write(str(year) + "\n")
f.write(str(week) + "\n")
f.close()

db = MySQLdb.connect(host="localhost", user="othuser", passwd="othpassword", db="OldTimeHockey")
cursor = db.cursor()
cursor.execute("UPDATE Teams SET PrevWeekPF=currentWeekPF")
db.commit()
