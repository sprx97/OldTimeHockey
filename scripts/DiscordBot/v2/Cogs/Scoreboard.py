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

        print(notafar)

        if len(root["dates"]) == 0:
            raise NoGamesTodayError()

        games = root["dates"][0]["games"]
        await ctx.send(len(games))
        # TODO: Implement this shiz

    #     found = False
    #     for game in games:
    #         away = team_map[game["teams"]["away"]["team"]["name"].split(" ")[-1].lower()]
    #         home = team_map[game["teams"]["home"]["team"]["name"].split(" ")[-1].lower()]
    #         if home == team or away == team:
    #             opp = home
    #             if home == team:
    #                 opp = away

    #             if game["status"]["detailedState"] == "Scheduled" or game["status"]["detailedState"] == "Pre-Game":
    #                 yield from message.channel.send(ParseFeeds.emojis[team] + " " + team + "'s game against " + ParseFeeds.emojis[opp] + " " + opp + " has not started yet.")
    #             else:
    #                 period = "(" + game["linescore"]["currentPeriodOrdinal"] + ")"
    #                 awayScore = game["teams"]["away"]["score"]
    #                 homeScore = game["teams"]["home"]["score"]
    #                 if game["status"]["detailedState"] == "Final":
    #                     if period == "(3rd)":
    #                         period = ""
    #                     yield from message.channel.send("Final: %s %s %s, %s %s %s %s" % (ParseFeeds.emojis[away], away, awayScore, ParseFeeds.emojis[home], home, homeScore, period))
    #                 else:
    #                     timeleft = game["linescore"]["currentPeriodTimeRemaining"]
    #                     period = period[:-1] + " " + timeleft + period[-1]
    #                     yield from message.channel.send("Current score: %s %s %s, %s %s %s %s" % (ParseFeeds.emojis[away], away, awayScore, ParseFeeds.emojis[home], home, homeScore, period))

    #             found = True
    #             break

    #     if not found:
    #         yield from message.channel.send("I do not think " + ParseFeeds.emojis[team] + " " + team + " plays tonight.")

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
