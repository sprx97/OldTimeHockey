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
        date = (datetime.now()-timedelta(hours=6)).strftime("%Y-%m-%d") # Offset by 6 hours to roll over the day in the morning

        root = make_api_call(f"https://statsapi.web.nhl.com/api/v1/schedule?date={date}&expand=schedule.linescore")

        if len(root["dates"]) == 0:
            raise NoGamesTodayError()

        # Loop through each game in today's schedule
        games = root["dates"][0]["games"]
        found = False
        for game in games:
            away = team_map[game["teams"]["away"]["team"]["name"].split(" ")[-1].lower()]
            home = team_map[game["teams"]["home"]["team"]["name"].split(" ")[-1].lower()]

            # These are not the teams you are looking for 👋🏻
            if home != team and away != team:
                continue

            home_emoji = emojis[home]
            away_emoji = emojis[away]

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
            await ctx.send(f"I do not think {emojis[team]} {team} plays today.")

    @score.error
    async def score_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: !score <NHL team>")
        elif isinstance(error, NHLTeamNotFound):
            await ctx.send(error.message)
        elif isinstance(error, LinkError):
            await ctx.send(error.message)
        elif isinstance(error, NoGamesTodayError):
            await ctx.send(error.message)
        else:
            await ctx.send(error)

    # TODO: Separate Cron Job to handle nightly rollover

    @tasks.loop(seconds=10.0)
    async def scores_loop(self):
        pass
        # TODO: Check for any goal updates

    @scores_loop.before_loop
    async def before_scores_loop(self):
        await self.bot.wait_until_ready()

def setup(bot):
    bot.add_cog(Scoreboard(bot))
