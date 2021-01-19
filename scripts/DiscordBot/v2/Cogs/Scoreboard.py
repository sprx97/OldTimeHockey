from discord.ext import commands, tasks
from Shared import *

class Scoreboard(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

    @commands.command(name="score")
    async def score(self, ctx, team):
        pass
        # TODO: Get the score for team

    @score.error
    async def score_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: !score <NHL team>")

    # TODO: Separate loop to handle nightly rollover?

    @tasks.loop(seconds=10.0)
    async def scores_loop(self):
        pass
        # TODO: Check for any goal updates

    @scores_loop.before_loop
    async def before_scores_loop(self):
        await self.bot.wait_until_ready()

def setup(bot):
    bot.add_cog(Scoreboard(bot))
