import urllib.request

f = open("/var/www/roldtimehockey/scripts/WeekVars.txt", "r")
year = int(f.readline().strip()) + 1
url = "http://challonge.com/woppacup%d" % (year)
req = urllib.request.Request(url, headers={"User-Agent" : "Magic Browser"})
response = urllib.request.urlopen(req)
print("%d" % (year))
page = response.read()
root = html.document_fromstring(page)

isactive = root.cssselect("li.active")[0].text_content() == "Final Stage"
if isactive:
	print("Final Stage has started")

# check that WC has started
# find my opponent via the woppacup site for the current year
# check both scores in the DB

