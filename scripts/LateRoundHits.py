import requests

year = "2023"
league_ids = ["12086", "12087", "12088", "12089", "12090", "12091", "12092", "12093"]

def round_we_care_about(round):
	return round >= 9 and round <= 12

def find_hits(league_id):
	total = {"F": 0, "D": 0}
	hits = {"F": 0, "D": 0}
	big_hits = {"F": 0, "D": 0}

	response = requests.get(f"http://www.fleaflicker.com/api/FetchLeagueDraftBoard?league_id={league_id}&season={year}&sport=NHL").json()

	for row in response["rows"]:
		round = row["round"]
		if not round_we_care_about(round):
			continue

		cells = row["cells"]

		if round % 2 == 0:
			cells.reverse()

		for pick in range(len(cells)):
			name = cells[pick]["player"]["proPlayer"]["nameLast"]
			pos = cells[pick]["player"]["proPlayer"]["positionEligibility"]
			pos = "G" if "G" in pos else "D" if "D" in pos else "F"
			if pos == "G":
				continue

			id = cells[pick]["player"]["proPlayer"]["id"]

			players = requests.get(f"http://www.fleaflicker.com/api/FetchPlayerListing?sport=NHL&league_id={league_id}&filter.query={name}").json()["players"]
			for player in players:
				if player["proPlayer"]["id"] == id:
					break

			if "viewingActualPointsAverage" in player:
				avg = float(player["viewingActualPointsAverage"]["formatted"])
			else:
				avg = 0.0

			total[pos] += 1
			if avg > 3.5:
				hits[pos] += 1
			if avg > 4.0:
				big_hits[pos] += 1

	return total, hits, big_hits

for id in league_ids:
	total, hits, big_hits = find_hits(id)
	print(id)
	print(f"\tF hits: {hits['F']}/{total['F']} ({big_hits['F']} big)")
	print(f"\tD hits: {hits['D']}/{total['D']} ({big_hits['D']} big)")
