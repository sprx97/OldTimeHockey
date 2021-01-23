# Discord Libraries
from discord.ext import commands, tasks

# Python Libraries
from datetime import datetime, timedelta

# Local Includes
from Shared import *

class Scoreboard(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.scores_loop.start()

    # Custom exception for a failure to fetch a link
    class NoGamesTodayError(discord.ext.commands.CommandError):
        def __init__(self, date):
            self.message = f"No games found today ({date})."

    def get_games_for_today(self):
        date = (datetime.now()-timedelta(hours=6)).strftime("%Y-%m-%d") # Offset by 6 hours to roll over the day in the morning
        root = make_api_call(f"https://statsapi.web.nhl.com/api/v1/schedule?date={date}&expand=schedule.linescore")

        if len(root["dates"]) == 0:
            raise self.NoGamesTodayError(date)

        return root["dates"][0]["games"]

    @commands.command(name="score")
    async def score(self, ctx, input, *extras):
        # Account for teams with two-word names (San Jose, St. Louis, Tampa Bay, etc)
        team = input
        if len(extras) > 0:
            team += " " + " ".join(extras)
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
            await ctx.send(f"I do not think {get_emoji(team)} {team} plays today.")

    @score.error
    async def score_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: !score <NHL team>")
        elif isinstance(error, NHLTeamNotFound):
            await ctx.send(error.message)
        elif isinstance(error, LinkError):
            await ctx.send(error.message)
        elif isinstance(error, self.NoGamesTodayError):
            await ctx.send(error.message)
        else:
            await ctx.send(error)

    # Update a message string that has already been sent
    async def update_goal(self, key, string, link):
        # Do nothing if nothing has changed
        if string == self.messages[key]["msg_text"] and link == self.messages[key]["msg_link"]:
            return

        embed = discord.Embed(title=string, url=link)
        self.messages[key]["msg_text"] = string
        self.messages[key]["msg_link"] = link
        for msgid in self.messages[key]["msg_id"]:
            msg = None
            for channel in get_channels_from_ids(self.bot, scoreboard_channel_ids):
                try:
                    msg = await channel.fetch_message(msgid)
                except:
                    continue
            if msg != None:
                # print("Edit:", key, msg.id, embed.title)
                await msg.edit(embed=embed)

        WritePickleFile(messages_datafile, self.messages)

    # Post a goal (or other related message) string to chat and track the data
    async def post_goal(self, key, string):
        self.messages[key] = {"msg_id":None, "msg_text":string, "msg_link":None}

        embed = discord.Embed(title=self.messages[key]["msg_text"], url=self.messages[key]["msg_link"])
        if self.messages[key]["msg_id"] == None:
            msgids = []
            for channel in get_channels_from_ids(self.bot, scoreboard_channel_ids):
                msg = await channel.send(embed=embed)
                msgids.append(msg.id)
                self.log.info(f"Post: {key} {msg.id} {string}")
            self.messages[key]["msg_id"] = msgids

        WritePickleFile(messages_datafile, self.messages)

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
            await self.post_goal(start_key, start_string)

        # TODO: Goal Plays
        # TODO: Final Scores

    @tasks.loop(seconds=10.0)
    async def scores_loop(self):
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
