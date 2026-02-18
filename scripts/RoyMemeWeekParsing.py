from lxml import html # xml parsing
import requests

matchup_ids = [638149, 638150, 638151, 638152, 638153, 638154]
periods = [10, 11, 12, 13, 14, 15, 16]

url = "https://www.fleaflicker.com/nhl/leagues/3914/scores/{matchup_id}?week=10"

for matchup in matchup_ids:
    response = requests.get(url.format(matchup_id=matchup))
    root = html.document_fromstring(response.text)
    team_a = root.cssselect(".table-striped thead .league-name a")[0].get("href")[24:29]
    team_b = root.cssselect(".table-striped thead .league-name a")[1].get("href")[24:29]
    rows_a = root.cssselect(".table-striped td.left div.player div.player-name a")[:14]
    rows_b = root.cssselect(".table-striped td.flip.right div.player div.player-name a")[:14]

    print(team_a)
    for period in periods:
        sum = 0.0
        num_players = 0
        for row in rows_a:
            player_link = "https://www.fleaflicker.com" + row.get("href") + "&fromWeek={period}&toWeek={period}"
            response = requests.get(player_link.format(period=period))
            player_root = html.document_fromstring(response.text)
            try:
                points = player_root.cssselect(".table-striped td.text-right")[0].text_content()
                if points != "—":
                    sum += float(points)
                    num_players += 1
            except IndexError:
                continue
        print(num_players, sum)
    print()
    quit()

    print(team_b)
    for period in periods:
        sum = 0.0
        num_players = 0
        for row in rows_b:
            player_link = "https://www.fleaflicker.com" + row.get("href") + "&fromWeek={period}&toWeek={period}"
            response = requests.get(player_link.format(period=period))
            player_root = html.document_fromstring(response.text)
            try:
                points = player_root.cssselect(".table-striped td.text-right")[0].text_content()
                if points != "—":
                    sum += float(points)
                    num_players += 1
            except IndexError:
                continue
        print(num_players, sum)
    print()