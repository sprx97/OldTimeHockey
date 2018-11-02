# Checks fleaflicker leagues for inactive owners

import MySQLdb
import urllib2
from lxml import html
import smtplib
from email.mime.text import MIMEText
import Config

unclaimed = {}
inactives = {}

f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip())
f.close()

def checkInactives(league):
        standingsURL = "http://www.fleaflicker.com/nhl/leagues/" + str(league[0]) + "?season=" + str(league[1])
        response = urllib2.urlopen(standingsURL)
        page = response.read()
        root = html.document_fromstring(page)

	users = root.cssselect("a.user-name.inactive")
	if len(users) > 0:
		key = league[2] + " (" + standingsURL + ")"
		inactives[key] = []
		for user in users:
			if user.text_content() != "OTHAdmin":
				inactives[key].append(user.text_content())
		if len(inactives[key]) == 0:
			del inactives[key]
	
	users = root.cssselect("a.btn-xs")
	if len(users) > 0:
		key = league[2] + " (" + standingsURL + ")"
		unclaimed[key] = len(users)

def sendEmail():
	body = ""
	if len(inactives) == 0 and len(unclaimed) == 0:
		body = "No inactive or unclaimed teams in any league currently!"
	else:
		for league in unclaimed:
			body += str(unclaimed[league]) + " unclaimed team(s) in " + league + "\n"
		
		if body != "":
			body += "\n"
		else:
			body += "No unclaimed teams.\n\n"

		count = 0
		for league in inactives:
			body += str(len(inactives[league])) + " inactive(s) in " + league + "\n"
			count += len(inactives[league])
			for user in inactives[league]:
				body += "\t" + user + "\n"
			body += "\n"
		if count == 0:
			body += "No inactive teams.\n"

	try:
		msg = MIMEText(body)
		msg["Subject"] = "OTH Inactives for week " + str(week)
		msg["From"] = "no-reply@roldtimehockey.com"
		recips = ["jeremy.vercillo@gmail.com", "2planksprevail@gmail.com", "zmc1031@gmail.com"]
		msg["To"] = ",".join(recips)

		s = smtplib.SMTP("localhost")
		s.sendmail(msg["From"], recips, msg.as_string())
		s.quit()

		print "Inactives email sent"
	except Exception as e:
		print "Error sending inactives email."
		print e, e.reason()

if __name__ == "__main__":
        db = MySQLdb.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
        cursor = db.cursor()

        cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
        leagues = cursor.fetchall()
        for league in leagues:
		checkInactives(league)

	sendEmail()
