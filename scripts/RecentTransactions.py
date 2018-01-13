import urllib2
from lxml import etree
from lxml import html

def printHtml(root, depth):
        for n in range(0, depth):
                print " ",
        print depth,
        print root.tag, root.get("class"), root.text
        for child in root:
                printHtml(child, depth+1)

leagueID = 5709
standingsURL = "http://www.fleaflicker.com/nhl/showTransactions.do?leagueId=" + str(leagueID) # + "&TransactionType=TRADE"                 + "&TableOffset=15"
											      # + "&TransactionType=ADD"
											      # + "&TransactionType=CLAIM"
											      # + "&TransactionType=CUT"
											      # + "&TransactionType=DRAFT"
response = urllib2.urlopen(standingsURL)
page = response.read()
root = html.document_fromstring(page).cssselect(".table")[0]

for trans in root.cssselect(".cell-row"):
	rel_date = trans.cssselect(".text-success")[0].text_content()
	day = trans[1].text_content()

	team = trans.cssselect(".league-name")[0].text_content()

	type = trans.cssselect(".fa")[0]
	if len(type.cssselect(".text-success")) > 0:
		type = "Add"
	elif len(type.cssselect(".text-warning")) > 0:
		type = "Claim"
	elif len(type.cssselect(".text-danger")) > 0:
		type = "Drop"
	else:
		type = "ERROR"

	player = trans.cssselect(".player")[0].text_content()
	player_pos = trans.cssselect(".position")[0].text_content()
	player_team = trans.cssselect(".player-team")[0].text_content()

	print rel_date, day, team, type, player, player_pos, player_team

# printHtml(root, 0)
