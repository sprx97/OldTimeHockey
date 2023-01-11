import Config
import pymysql
import Shared
import sys

db = pymysql.connect(host=Config.config["sql_hostname"], user=Config.config["sql_username"], passwd=Config.config["sql_password"], db=Config.config["sql_dbname"])
cursor = db.cursor(pymysql.cursors.DictCursor)

def GetScores(league_id, year, week=None):
    # This first call is just used to get all "Eligible Scoring Periods" ie weeks
    base_scoreboard = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}")
    for period in base_scoreboard["eligibleSchedulePeriods"]:
        week_id = int(period["ordinal"])
        playoff_week = Shared.is_playoff_week(week_id, year)

        # If we requested a specific week, skip until we get to it
        if week != None and week != week_id:
            continue

        start = period["low"]["ordinal"]
        end = period["high"]["ordinal"]

        # This scoreboard call gets the scoreboard from each week by using the starting day of the scoring period
        scoreboard = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueScoreboard?sport=NHL&league_id={league_id}&season={year}&scoring_period={start}")
        if "isFinalScore" not in scoreboard["games"][0]:
            print("Week is not final. Ending.")
            return

        for game in scoreboard["games"]:
            game_id = game["id"]
            away_id = game["away"]["id"]
            home_id = game["home"]["id"]

            # Finally, this call gets the actual boxscore of the game.
            # Unfortunately this has to be done day by day and will be really slow.
            for day in range(start, end+1):
                boxscore = Shared.make_api_call(f"http://www.fleaflicker.com/api/FetchLeagueBoxscore?sport=NHL&league_id={league_id}&fantasy_game_id={game_id}&scoring_period={day}")

                points_away = float(boxscore["pointsAway"]["scoringPeriod"]["value"]["formatted"])
                points_home = float(boxscore["pointsHome"]["scoringPeriod"]["value"]["formatted"])
                optimum_away = float(boxscore["pointsAway"]["scoringPeriod"]["optimum"]["formatted"])
                optimum_home = float(boxscore["pointsHome"]["scoringPeriod"]["optimum"]["formatted"])

                # Helper function to count the number of players given a lineup object
                def count_num_players(lineup):
                    count = 0
                    for slot in lineup:
                        if "viewingActualPoints" in slot["leaguePlayer"] and "value" in slot["leaguePlayer"]["viewingActualPoints"]:
                            count += 1

                    return count

                home_lineup = []
                away_lineup = []
                for slot in boxscore["lineups"][0]["slots"]:
                    if "away" in slot:
                        away_lineup.append({"leaguePlayer" : slot["away"]})
                    if "home" in slot:
                        home_lineup.append({"leaguePlayer" : slot["home"]})

                num_players_away = count_num_players(away_lineup)
                num_players_home = count_num_players(home_lineup)
                optimum_num_players_away = count_num_players(boxscore["pointsAway"]["scoringPeriod"]["optimumLineup"])
                optimum_num_players_home = count_num_players(boxscore["pointsHome"]["scoringPeriod"]["optimumLineup"])

                # TODO: Found an interesting flea bug that miscalculates OptimumPF/Lineup. 
                # Can be seen in the home team here: https://www.fleaflicker.com/nhl/leagues/12086/scores/2854898?week=82
                # I think it just isn't handling multi-position eligibility well
                # Because of this, let's assume the optimum score can't be less than the actual score
                # This technically isn't true because plays can score negative, but not worth fretting over
                if optimum_home < points_home:
                    optimum_home = points_home
                    optimum_num_players_home = num_players_home
                if optimum_away < points_away:
                    optimum_away = points_away
                    optimum_num_players_away = num_players_away

                # Insert this data into our table
                home_data = {"team_id": home_id, 
                             "year": year, 
                             "scoring_period": day, 
                             "game_id": game_id, 
                             "opponent_team_id": away_id,
                             "week": week_id,
                             "is_playoff_week": playoff_week,
                             "points": points_home,
                             "optimum_points": optimum_home,
                             "num_players": num_players_home,
                             "optimum_num_players": optimum_num_players_home}
                away_data = {"team_id": away_id, 
                             "year": year, 
                             "scoring_period": day, 
                             "game_id": game_id, 
                             "opponent_team_id": home_id,
                             "week": week_id,
                             "is_playoff_week": playoff_week,
                             "points": points_away,
                             "optimum_points": optimum_away,
                             "num_players": num_players_away,
                             "optimum_num_players": optimum_num_players_away}

                cursor.execute(f"INSERT INTO Scoring ({', '.join(home_data.keys())}) VALUES ({', '.join([str(val) for val in home_data.values()])})")
                cursor.execute(f"INSERT INTO Scoring ({', '.join(away_data.keys())}) VALUES ({', '.join([str(val) for val in away_data.values()])})")

                # TODO: Stored procedures for quicker data access (queries that will be used frequently)
                # - GetCareerPFTotal(user_id) -- needs to union with Teams table
                # - GetCareerOptimumPF(user_id) -- needs to union with Teams table
                # - GetSeasonPFTotal(team_id, year)
                # - GetSeasonOptimumPF(team_id, year)
                # - GetPlayoffPFTotal(team_id, year)
                # - GetPlayoffOptimumPF(team_id, year)
                # - GetWeekPFTotal(team_id, year, week)
                # - TODO: PA-related procedures?
                # - TODO: Matchup-related procedures?

                # TODO: Links for indexing/stored procedures
                # https://mysqlcode.com/mysql-indexing-a-complete-guide/#:~:text=In%20MySQL%20indexing%20is%20used%20for%20faster%20retrieval,going%20through%20all%20the%20values%20of%20the%20table.
                # https://www.mysqltutorial.org/introduction-to-sql-stored-procedures.aspx#:~:text=Code%20language%3A%20SQL%20%28Structured%20Query%20Language%29%20%28sql%29%20And,as%20a%20cache%2C%20and%20execute%20the%20stored%20procedure.
                # https://stackoverflow.com/questions/17481890/how-to-write-a-stored-procedure-in-phpmyadmin

                # TODO: Would it be possible to pull number of moves used in a week?

                # TODO: Cleanup existing "Teams" and "Teams_post" tables when this is finished. Lots of extraneous data in there.
                # TODO: Also ensure that table is handled in backupdata.py
                # TODO: Ensure this runs every week via crontab

                # TODO: Set up method take arguments for specific year, league, week, etc. Should be able to use weeksVars.txt to run this constantly

            print(f"Finished {league_id} {year} week {week_id}")

# Default uses the previous week from the WeekVars file
f = open(Config.config["srcroot"] + "scripts/WeekVars.txt", "r")
year = int(f.readline().strip())
week = int(f.readline().strip()) - 1

# If arguments are given, override the defaults
if len(sys.argv) >= 2:
    year = int(sys.argv[1])
    week = None # week == None means it will do all weeks of that season.
if len(sys.argv) == 3:
    week = int(sys.argv[2])

# Get all leagues for the year
cursor.execute(f"SELECT id, name from Leagues where year={year}")
leagues = cursor.fetchall()

print(year, week)

# Get the scores from all leagues for the given year and week
for league in leagues:
    id, name = league["id"], league["name"]
    print(f"Getting Scores for {name} {year} Week {week}")
    GetScores(id, year, week)
    db.commit()
