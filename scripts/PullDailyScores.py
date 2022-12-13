from Shared import *

#db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
#cursor = db.cursor()
#cursor.execute("SELECT * from Leagues where year=" + str(year)) # queries for all leagues that year
#leagues = cursor.fetchall()
#for league in leagues:

year = 2022
league_id = 12086

# This first call is just used to get all "Eligible Scoring Periods" ie weeks
base_scoreboard = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}")
for week in base_scoreboard["eligibleSchedulePeriods"]:
    week_id = week["ordinal"]
    start = week["low"]["ordinal"]
    end = week["high"]["ordinal"]

    # This scoreboard call gets the scoreboard from each week by using the starting day of the scoring period
    scoreboard = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}&scoring_period={start}")
    if "isFinalScore" not in scoreboard["games"][0]:
        print("Week is not final. Ending.")
        quit()

    for game in scoreboard["games"]:
        game_id = game["id"]
        away_id = game["away"]["id"]
        home_id = game["home"]["id"]

        # Finally, this call gets the actual boxscore of the game.
        # Unfortunately this has to be done day by day and will be really slow.
        for day in range(start, end+1):
            boxscore = make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueBoxscore?sport=NHL&league_id={league_id}&fantasy_game_id={game_id}&scoring_period={day}")

            points_away = float(boxscore["pointsAway"]["scoringPeriod"]["value"]["formatted"])
            points_home = float(boxscore["pointsHome"]["scoringPeriod"]["value"]["formatted"])
            optimum_away = float(boxscore["pointsAway"]["scoringPeriod"]["optimum"]["formatted"])
            optimum_home = float(boxscore["pointsHome"]["scoringPeriod"]["optimum"]["formatted"])

            print(f"{away_id} {year} {week_id} {day} {points_away} {optimum_away}")
            print(f"{home_id} {year} {week_id} {day} {points_home} {optimum_home}")

            # TODO: Now insert this into a daily scores table
            # TODO: Figure out table scheme
            # - (PK) team_id
            # - (PK) year
            # - (PK) week
            # - (PK) scoring_period
            # - points
            # - optimum_points
            # TODO: Also ensure that table is handled in backupdata.py
            # TODO: Ensure this runs every week via crontab

        print()
