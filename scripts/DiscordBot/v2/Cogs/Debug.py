# Discord Libraries
from discord.ext import commands

# Python Libraries
import logging

# Local Includes
from Shared import *

class Debug(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

    # Basic call-and-response commands to test if bot is working.
    @commands.command(name="ping")
    async def ping(self, ctx):
        await ctx.send("pong")

    @commands.command(name="pong")
    async def pong(self, ctx):
        await ctx.send("ping")

    # Displays how long it's been since the bot (not the cog) was last restarted
    @commands.command(name="uptime")
    async def uptime(self, ctx):
        days, hours, minutes, seconds = self.bot.calculate_uptime()
        
        msg = "It has been "
        if days > 0:
            msg += str(days) + " day(s), "
        if days > 0 or hours > 0:
            msg += str(hours) + " hour(s), "
        if days > 0 or hours > 0 or minutes > 0:
            msg += str(minutes) + " minute(s), "
        msg += str(seconds) + " second(s) since last accident."

        await ctx.send(msg)

    # Displays a list of commands that can be used in this server.
    @commands.command(name="help")
    async def help(self, ctx):
        if commands.check(is_OTH_guild()):
            await ctx.message.channel.send("I'm Wes McCauley, the official referee of /r/OldTimeHockey. Here are some of the commands I respond to:\n" + \
                                        "**!help**\n\tDisplays this list of commands.\n" + \
                                        "**!ping or !pong**\n\tGets a response to check that bot is up.\n" + \
                                        "**!matchup <fleaflicker username>**\n\tPosts the score of the user's fantasy matchup this week.\n" + \
                                        "**!score <NHL team>**\n\tPosts the score of the given NHL team's game tonight. Accepts a variety of nicknames and abbreviations.\n" + \
                                        "**!ot <NHL team> <player name/number>**\n\tAllows you to predict a player to score the OT winner.\n\tMust be done between 5 minutes left" + \
                                        "in the 3rd period and the start of OT of a tied game.\n\tCan only guess one player per game.\n" + \
                                        "**!ot standings**\n\tDisplays the standings for the season-long OT prediction contest on this server.")
        if commands.check(is_KK_guild()):
            await ctx.message.channel.send("I'm Wes McCauley, the official referee of Keeping Karlsson. Here are some of the commands I respond to:\n" + \
                                            "**!help**\n\tDisplays this list of commands.\n" + \
                                            "**!ping or !pong**\n\tGets a response to check that bot is up.\n" + \
                                            "**!score <NHL team>**\n\tPosts the score of the given NHL team's game tonight. Accepts a variety of nicknames and abbreviations.\n" + \
                                            "**!ot <NHL team> <player name/number>**\n\tAllows you to predict a player to score the OT winner.\n\tMust be done between 5 minutes left" + \
                                            "in the 3rd period and the start of OT of a tied game.\n\tCan only guess one player per game.\n" + \
                                            "**!ot standings**\n\tDisplays the standings for the season-long OT prediction contest on this server.")

    # Shuts down the bot or a cog
    @commands.command(name="kill", aliases=["shutdown", "unload"])
    @commands.is_owner()
    @is_tech_channel()
    async def kill(self, ctx, cog="all"):
        if cog == "all":
            self.bot.killed = True
            await self.bot.close()
            self.log.info("Manually killed bot.")
        else:
            self.bot.unload_extension(f"Cogs.{cog}")
            ctx.send(f"Cogs.{cog} successfully unloaded.")
            self.log.info(f"Unloaded Cogs.{cog}.")

    # Error handler for kill command
    @kill.error
    async def kill_error(self, ctx, error):
        await ctx.send(msg = "Failure in kill: " + str(error))

    # Reloads a cog
    @commands.command(name="reload", aliases=["reboot", "restart"])
    @commands.is_owner()
    @is_tech_channel()
    async def reload(self, ctx, cog):
        self.bot.reload_extension(f"Cogs.{cog}")
        await ctx.send(f"Cogs.{cog} successfully reloaded.")
        self.log.info(f"Reloaded Cogs.{cog}.")

    # Error handler for reloading cog
    @reload.error
    async def reload_error(self, ctx, error):
        await ctx.send("Failure in reload: " + str(error))

def setup(bot):
    bot.add_cog(Debug(bot))
