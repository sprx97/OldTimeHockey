# Python libraries
import json
import os
import random
import sys
import ujson

# Yahoo sports libraries
from yahoo_oauth import OAuth2
import yahoo_fantasy_api as yfa

leagues = ["34680"] # Just T1 Sweden
NUM_TEAMS_PER_LEAGUE = 16 # For T1
NUM_TEAMS_MAKING_PLAYOFFS = 6
LOWEST_RANK_MAKING_CONSOLATION = 12
NUM_TEAMS_GETTING_BYE = 2

stddev = 60 # Educated guess
def project_winner(teams, away, home):
	away_random_pf = random.gauss(teams[away]["PF_avg"], stddev)
	home_random_pf = random.gauss(teams[home]["PF_avg"], stddev)

	teams[away]["PF"] += away_random_pf
	teams[home]["PF"] += home_random_pf
	if away_random_pf > home_random_pf:
		teams[away]["wins"] += 1
		teams[home]["losses"] += 1
		return away
	else:
		teams[away]["losses"] += 1
		teams[home]["wins"] += 1
		return home

def calc_playoff_odds(league):
	settings = league.settings()
	print(settings["name"])

	# Get the current standings and extract the relevant information
	standings = league.standings()
	teams = {}
	for team in standings:
		id = team["team_key"]
		name = team["name"]
		wins = int(team["outcome_totals"]["wins"])
		losses = int(team["outcome_totals"]["losses"])
		ties = int(team["outcome_totals"]["ties"])
		pf = float(team["points_for"])
		pf_avg = pf/(wins+losses)

		teams[id] = {
			"name": name,
			"wins": wins,
		    "losses": losses,
			"ties": ties,
		    "PF": pf,
		    "PF_avg": pf_avg,
		    "playoff_odds": 0,
			"consolation_odds": 0,
			"bye_odds": 0,
		    "seeds": [0]*NUM_TEAMS_PER_LEAGUE,
		    "records": {},
		    "current_week": {"win": {"make_playoffs": 0, "make_consolation": 0, "made_bye": 0, "total": 0}, "loss": {"make_playoffs": 0, "make_consolation": 0, "made_bye": 0, "total": 0}}}

	# Get the schedule for all remaining weeks
	weeks = ";week="
	for week in range(int(league.current_week()), int(settings["playoff_start_week"])):
		weeks += str(week) + ","
	weeks = weeks[:-1]
	matchups = game.yhandler.get(f"league/{league.league_id}/scoreboard{weeks}")["fantasy_content"]["league"][1]["scoreboard"]["0"]["matchups"]
	del matchups["count"]

	# Simulate all remaining matchups a set number of times.
	# Needs to be at least on the order of 10000. Ideally 100000 but that can be very slow (up to a minute per league or longer)
	num_simulations = 100000
	for _ in range(num_simulations):
		copy_teams = ujson.loads(ujson.dumps(teams)) # This is a hack that's faster than traditional python copy.deepcopy

		for n, matchup in matchups.items():
			away = matchup["matchup"]["0"]["teams"]["0"]["team"][0][0]["team_key"]
			home = matchup["matchup"]["0"]["teams"]["1"]["team"][0][0]["team_key"]

			winner = project_winner(copy_teams, away, home)

			if int(n) < NUM_TEAMS_PER_LEAGUE/2: # Current week (ie first matchup for each team)
				copy_teams[winner]["win_current_week"] = True

		# After each simulation, update the running totals in the orignal "teams" dict
		# for various playoff/seeding odds
		copy_teams = dict(sorted(copy_teams.items(), key=lambda item: (item[1]["wins"], item[1]["ties"], item[1]["PF"]), reverse=True))
		team_keys = list(copy_teams.keys())
		for rank in range(len(team_keys)):
			team = team_keys[rank]

			# Basic playoff odds counter (gets divided by num_simulations after all the loops)
			teams[team]["seeds"][rank] += 1
			if rank < NUM_TEAMS_MAKING_PLAYOFFS:
				teams[team]["playoff_odds"] += 1
			elif rank < LOWEST_RANK_MAKING_CONSOLATION:
				teams[team]["consolation_odds"] += 1
			if rank < NUM_TEAMS_GETTING_BYE:
				teams[team]["bye_odds"] += 1

			# Odds by record in remaining games
			record = f"{copy_teams[team]['wins'] - teams[team]['wins']}-{copy_teams[team]['losses'] - teams[team]['losses']}"
			if record not in teams[team]["records"]:
				teams[team]["records"][record] = {"made_playoffs": 0, "made_consolation": 0, "made_bye": 0, "total": 0}
			teams[team]["records"][record]["total"] += 1
			if rank < NUM_TEAMS_MAKING_PLAYOFFS:
				teams[team]["records"][record]["made_playoffs"] += 1
			elif rank < LOWEST_RANK_MAKING_CONSOLATION:
				teams[team]["records"][record]["made_consolation"] += 1
			if rank < NUM_TEAMS_GETTING_BYE:
				teams[team]["records"][record]["made_bye"] += 1

			# Odds by current week results
			if "win_current_week" in copy_teams[team]:
				teams[team]["current_week"]["win"]["total"] += 1
				if rank < NUM_TEAMS_MAKING_PLAYOFFS:
					teams[team]["current_week"]["win"]["make_playoffs"] += 1
				elif rank < LOWEST_RANK_MAKING_CONSOLATION:
					teams[team]["current_week"]["win"]["make_consolation"] += 1
				if rank < NUM_TEAMS_GETTING_BYE:
					teams[team]["current_week"]["win"]["made_bye"] += 1

			else:
				teams[team]["current_week"]["loss"]["total"] += 1
				if rank < NUM_TEAMS_MAKING_PLAYOFFS:
					teams[team]["current_week"]["loss"]["make_playoffs"] += 1
				elif rank < LOWEST_RANK_MAKING_CONSOLATION:
					teams[team]["current_week"]["loss"]["make_consolation"] += 1
				if rank < NUM_TEAMS_GETTING_BYE:
					teams[team]["current_week"]["loss"]["made_bye"] += 1

	print("Simulations completed")

	# Tidy up, sort, and format all the data to print/store
	for team in teams:
		teams[team]["playoff_odds"] = round(teams[team]["playoff_odds"] / (num_simulations/100), 2)
		teams[team]["consolation_odds"] = round(teams[team]["consolation_odds"] / (num_simulations/100), 2)
		teams[team]["bye_odds"] = round(teams[team]["bye_odds"] / (num_simulations/100), 2)
		teams[team]["seeds"] = [round(x / num_simulations * 100, 2) for x in teams[team]["seeds"]]
		teams[team]["records"] = dict(sorted(teams[team]["records"].items(), key=lambda item: int(item[0].split("-")[0]), reverse=True))

		for record in teams[team]["records"]:
			teams[team]["records"][record]["playoff_odds"] = round(teams[team]["records"][record]["made_playoffs"] / teams[team]["records"][record]["total"] * 100, 2)
			teams[team]["records"][record]["consolation_odds"] = round(teams[team]["records"][record]["made_consolation"] / teams[team]["records"][record]["total"] * 100, 2)
			teams[team]["records"][record]["bye_odds"] = round(teams[team]["records"][record]["made_bye"] / teams[team]["records"][record]["total"] * 100, 2)

		teams[team]["current_week"]["win"]["playoff_odds"] = round(teams[team]["current_week"]["win"]["make_playoffs"] / teams[team]["current_week"]["win"]["total"] * 100, 2)
		teams[team]["current_week"]["loss"]["playoff_odds"] = round(teams[team]["current_week"]["loss"]["make_playoffs"] / teams[team]["current_week"]["loss"]["total"] * 100, 2)
		teams[team]["current_week"]["win"]["consolation_odds"] = round(teams[team]["current_week"]["win"]["make_consolation"] / teams[team]["current_week"]["win"]["total"] * 100, 2)
		teams[team]["current_week"]["loss"]["consolation_odds"] = round(teams[team]["current_week"]["loss"]["make_consolation"] / teams[team]["current_week"]["loss"]["total"] * 100, 2)
		teams[team]["current_week"]["win"]["bye_odds"] = round(teams[team]["current_week"]["win"]["made_bye"] / teams[team]["current_week"]["win"]["total"] * 100, 2)
		teams[team]["current_week"]["loss"]["bye_odds"] = round(teams[team]["current_week"]["loss"]["made_bye"] / teams[team]["current_week"]["loss"]["total"] * 100, 2)


	print(json.dumps(teams, indent=4))

	for team in teams:
		print(f"{(teams[team]['name'][:10]):10s}\t{(teams[team]['bye_odds']):.2f}\t{(teams[team]['playoff_odds']):.2f}\t{(teams[team]['consolation_odds']):.2f}\t{(100-teams[team]['playoff_odds']-teams[team]['consolation_odds']):.2f}")

# MAIN
oauth_file = "/var/www/OldTimeHockey/scripts/PlayoffOdds/yahoo_auth.json"
conn = OAuth2(None, None, from_file=oauth_file)
if not conn.token_is_valid():
    conn.refresh_access_token()

game = yfa.Game(conn, "nhl")
game_id = game.game_id()

for league in leagues:
	league_id = f"{game_id}.l.{league}"
	league = game.to_league(league_id)
	calc_playoff_odds(league)
