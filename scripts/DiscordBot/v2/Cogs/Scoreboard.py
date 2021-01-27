# Discord Libraries
from discord.ext import commands, tasks

# Python Libraries
from datetime import datetime, timedelta

# Local Includes
from Shared import *

class Scoreboard(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.date = (datetime.now()-timedelta(hours=6)).strftime("%Y-%m-%d")
        self.scores_loop.start()
        self.loops = [self.scores_loop]

    # Gets a list of games for the current date
    def get_games_for_today(self):
        root = make_api_call(f"https://statsapi.web.nhl.com/api/v1/schedule?date={self.date}&expand=schedule.linescore")

        if len(root["dates"]) == 0:
            raise NoGamesTodayError(self.date)

        return root["dates"][0]["games"]

    @commands.command(name="score")
    async def score(self, ctx, input, *extras):
        # Account for teams with two-word names (San Jose, St. Louis, Tampa Bay, etc)
        team = input
        if len(extras) > 0:
            team += " " + " ".join(extras)
        team = team.replace("[", "").replace("]", "")
        team = team.lower()

        if team not in team_map:
            raise NHLTeamNotFound(input)

        team = team_map[team]

        # Loop through each game in today's schedule
        games = self.get_games_for_today()
        found = False
        for game in games:
            away = team_map[game["teams"]["away"]["team"]["name"].split(" ")[-1].lower()]
            home = team_map[game["teams"]["home"]["team"]["name"].split(" ")[-1].lower()]

            # These are not the teams you are looking for 👋🏻
            if home != team and away != team:
                continue

            home_emoji = get_emoji(home)
            away_emoji = get_emoji(away)

            game_state = game["status"]["detailedState"]
            # Game hasn't started yet
            if game_state == "Scheduled" or game_state == "Pre-Game":
                await ctx.send(f"{away_emoji} {away} vs {home_emoji} {home} has not started yet.")
            else:
                period = "(" + game["linescore"]["currentPeriodOrdinal"] + ")"
                away_score = game["teams"]["away"]["score"]
                home_score = game["teams"]["home"]["score"]

                # Game is over
                if game_state == "Final":
                    if period == "(3rd)":
                        period = ""
                    status = "Final:"
                # Game is in progress
                else:
                    timeleft = game["linescore"]["currentPeriodTimeRemaining"]
                    period = period[:-1] + " " + timeleft + period[-1]
                    status = "Current score:"
                await ctx.send(f"{status} {away_emoji} {away} {away_score}, {home_emoji} {home} {home_score} {period}")

            found = True
            break

        if not found:
            raise TeamDoesNotPlayToday(team)

    @score.error
    async def score_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: !score [NHL team]")
        elif isinstance(error, NHLTeamNotFound):
            await ctx.send(error.message)
        elif isinstance(error, LinkError):
            await ctx.send(error.message)
        elif isinstance(error, NoGamesTodayError):
            await ctx.send(error.message)
        elif isinstance(error, TeamDoesNotPlayToday):
            await ctx.send(error.message)
        else:
            await ctx.send(error)

    # Gets the game recap link
    def get_recap_link(self, key):
        try:
            game_id = key.split(":")[0]
            media = make_api_call(f"https://statsapi.web.nhl.com/api/v1/game/{game_id}/content")
            for item in media["media"]["epg"]:
                if item["title"] == "Recap":
                    return item["items"][0]["playbacks"][3]["url"] # 3 = FLASH_1800K_896x504
        except:
            return None

    # Gets the highlight link for a goal
    def get_media_link(self, key):
        try:
            game_id, event_id = key.split(":")
            media = make_api_call(f"https://statsapi.web.nhl.com/api/v1/game/{game_id}/content")
            for event in media["media"]["milestones"]["items"]:
                if event["statsEventId"] == event_id:
                    return event["highlight"]["playbacks"][3]["url"] # 3 = FLASH_1800K_896x504
        except:
            return None

    # Gets the strength (EV, PP, SH, EN) of a goal 
    def get_goal_strength(self, goal):
        strength = f"({goal['result']['strength']['code']}) "
        if strength == "(EVEN) ":
            strength = ""
        if "emptyNet" in goal["result"] and goal["result"]["emptyNet"]:
            strength += "(EN) "

        # TODO: Check for Penalty Shot
        # Preceding play (key-1) would be type "Penalty" with penaltySeverity "Penalty Shot"
        # Sample game: https://statsapi.web.nhl.com/api/v1/game/2020020074/feed/live

        return strength

    # Update a message string that has already been sent
    async def update_goal(self, key, string, link):
        # Do nothing if nothing has changed, including the link.
        if string == self.messages[key]["msg_text"] and link == self.messages[key]["msg_link"]:
            return

        self.messages[key]["msg_text"] = string
        self.messages[key]["msg_link"] = link
        embed = discord.Embed(title=string, url=link)

        # Update all the messages that have been posted containing this
        for channel_id, msg_id in self.messages[key]["msg_id"].items():
            try:
                msg = await self.bot.get_channel(channel_id).fetch_message(msg_id)
                await msg.edit(embed=embed)
                self.log.info(f"Edit: {key} {channel_id}:{msg_id} {string} {link}")
            except Exception as e:
                self.log.warn(e)
                continue

    # Post a goal (or other related message) string to chat and track the data
    async def post_goal(self, key, string, link):
        # If this key already exists, we're updating, not posting
        if key in self.messages:
            await self.update_goal(key, string, link)
            return

        embed = discord.Embed(title=string, url=link)

        msgids = {}
        for channel in get_channels_from_ids(self.bot, scoreboard_channel_ids):
            msg = await channel.send(embed=embed)
            msgids[channel.id] = msg.id
            self.log.info(f"Post: {key} {channel.id}:{msg.id} {string} {link}")

        self.messages[key] = {"msg_id":msgids, "msg_text":string, "msg_link":link}

    # Checks for new goals in the play-by-play and posts them
    async def check_for_goals(self, key, playbyplay):
        # Get list of scoring play ids
        goals = playbyplay["liveData"]["plays"]["scoringPlays"]
        away = playbyplay["gameData"]["teams"]["away"]["abbreviation"]
        home = playbyplay["gameData"]["teams"]["home"]["abbreviation"]

        # Check all the goals to report new ones
        for goal in goals:
            goal = playbyplay["liveData"]["plays"]["allPlays"][goal]
            goal_key = f"{key}:{goal['about']['eventId']}"

            # Find the strength of the goal
            strength = self.get_goal_strength(goal)

            # Find the team that scored the goal
            team_code = goal["team"]["triCode"]
            team = f"{get_emoji(team_code)} {team_code}"

            # Find the period and time the goal was scored in
            time = f"{goal['about']['periodTime']} {goal['about']['ordinalNum']}"

            # Create the full string to post to chat
            # NB, the spacing after strength is handled in get_goal_strength
            goal_str = f"{get_emoji('goal')} GOAL {strength}{team} {time}: {goal['result']['description']}"
            score = f" ({away} {goal['about']['goals']['away']}, {home} {goal['about']['goals']['home']})"
            goal_str += score

            # Find the media link if we don't have one for this goal yet
            if goal_key not in self.messages or self.messages[goal_key]["msg_link"] == None:
                goal_link = self.get_media_link(goal_key)
            else:
                goal_link = self.messages[goal_key]["msg_link"]

            await self.post_goal(goal_key, goal_str, goal_link)

    # Checks for disallowed goals (ones we have posted, but are no longer in the play-by-play) and updates them
    async def check_for_disallowed_goals(self, key, playbyplay):
        # Get list of scoring play ids
        goals = playbyplay["liveData"]["plays"]["scoringPlays"]

        # Loop through all of our pickled goals
     	# If one of them doesn't exist in the list of scoring plays anymore
     	# We should cross it out and notify that it was disallowed.
        for pickle_key in list(self.messages.keys()):
            game_id, event_id = pickle_key.split(":")

            # Skip goals from other games, or start, end, and disallow events
            if game_id != key or event_id == "S" or event_id == "E" or event_id[-1] == "D":
                continue

            found = False
            for goal in goals:
                if event_id == str(playbyplay["liveData"]["plays"]["allPlays"][goal]["about"]["eventId"]):
                    found = True
                    break

            # This goal is still there, no need to disallow
            # Continue onto next pickle_key
            if found:
                continue

            # Skip updating goals that have already been crossed out
            if self.messages[pickle_key]["msg_text"][0] != "~":
                await self.post_goal(pickle_key, f"~~{self.messages[pickle_key]['msg_text']}~~", None)

            # Announce that the goal has been disallowed
            disallow_key = pickle_key + "D"
            if disallow_key not in self.messages:
                away = playbyplay["gameData"]["teams"]["away"]["abbreviation"]
                home = playbyplay["gameData"]["teams"]["home"]["abbreviation"]
                disallow_str = f"Goal disallowed in {away}-{home}."
                await self.post_goal(disallow_key, disallow_str, None)

    # Parses a game play-by-play and posts start, goals, and end messages
    async def parse_game(self, game):
        # Get the game from NHL.com
        playbyplay = make_api_call(f"https://statsapi.web.nhl.com{game['link']}")

        away = playbyplay["gameData"]["teams"]["away"]["abbreviation"]
        home = playbyplay["gameData"]["teams"]["home"]["abbreviation"]
        away_emoji = get_emoji(away)
        home_emoji = get_emoji(home)
        key = str(playbyplay["gamePk"])
        game_state = playbyplay["gameData"]["status"]["detailedState"]

        # Send game starting notification if necessary
        start_key = key + ":S"
        if game_state == "In Progress" and start_key not in self.messages: 
            start_string = away_emoji + " " + away + " at " + home_emoji + " " + home + " Starting."
            await self.post_goal(start_key, start_string, None)

        # Send goal and disallowed goal notifications
        await self.check_for_disallowed_goals(key, playbyplay)
        await self.check_for_goals(key, playbyplay)              
                
        # Check whether the game finished notification needs to be sent
        end_key = key + ":E"
        if game_state == "Final" and end_key not in self.messages:
            # Some exhibition games don't get play-by-play data. Skip these.
            all_plays = playbyplay["liveData"]["plays"]["allPlays"]
            if len(all_plays) == 0:
                return

            event_type_id = all_plays[-1]["result"]["eventTypeId"]
            if event_type_id == "GAME_END" or event_type_id == "GAME_OFFICIAL":
                away_score = all_plays[-1]["about"]["goals"]["away"]
                home_score = all_plays[-1]["about"]["goals"]["home"]

                # Sometimes shootout winners take longer to report, so allow this to defer to the next cycle
                skip = False
                if away_score == home_score: # adjust for shootout winner
                    shootout_info = playbyplay["liveData"]["linescore"]["shootoutInfo"]
                    if shootout_info["away"]["scores"] > shootout_info["home"]["scores"]:
                        away_score += 1
                    elif shootout_info["away"]["scores"] < shootout_info["home"]["scores"]:
                        home_score += 1
                    else:
                        skip = True

                if skip:
                    return

                # Report the final score, including the OT/SO tag
                period = f"({all_plays[-1]['about']['ordinalNum']})"
                if period == "(3rd)": # No additional tag for a regulation final
                    period = ""
                final_str = f"{get_emoji(away)} {away} {away_score}, {get_emoji(home)} {home} {home_score} Final {period}"
                await self.post_goal(end_key, final_str, None)

        # Find the game recap link if we don't have it already.
        if game_state == "Final" and end_key in self.messages and self.messages[end_key]["msg_link"] == None:
            recap_link = self.get_recap_link(end_key)
            if recap_link != None:
                await self.post_goal(end_key, self.messages[end_key]["msg_text"], recap_link)

        WritePickleFile(messages_datafile, self.messages)

    # Checks if this iteration is "tomorrow", and does some cleanup code
    def check_date_rollover(self):
        date = (datetime.now()-timedelta(hours=6)).strftime("%Y-%m-%d")
        if self.date == date:
            return

        self.log.info("Rolling over date.")

        # TODO: Import OT and Pickems cogs, and run their Process Standings methods

        for f in [messages_datafile, ot_datafile, pickems_datafile]:
            WritePickleFile(f, {}) # Reset files

        self.date = date

    @tasks.loop(seconds=10.0)
    async def scores_loop(self):
        self.check_date_rollover()

        self.messages = LoadPickleFile(messages_datafile)

        games = self.get_games_for_today()

        for game in games:
            await self.parse_game(game)

    @scores_loop.before_loop
    async def before_scores_loop(self):
        await self.bot.wait_until_ready()

    @scores_loop.error
    async def scores_loop_error(self, error):
        await self.cog_command_error(None, error)

def setup(bot):
    bot.add_cog(Scoreboard(bot))
