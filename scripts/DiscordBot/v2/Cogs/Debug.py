# Discord Libraries
from discord.ext import commands

# Python Libraries
import asyncio
from datetime import datetime, timedelta
import importlib
import logging

# Local Includes
Shared = importlib.import_module("Shared")
from Shared import *

class Debug(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.rollover_loop.start()
        self.loops = [self.rollover_loop]

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
                                        "**!matchup [fleaflicker username]**\n\tPosts the score of the user's fantasy matchup this week.\n" + \
                                        "**!score [NHL team]**\n\tPosts the score of the given NHL team's game tonight. Accepts a variety of nicknames and abbreviations.\n" + \
                                        "**!ot [NHL team] [player name/number]**\n\tAllows you to predict a player to score the OT winner.\n\tMust be done between 5 minutes left" + \
                                        "in the 3rd period and the start of OT of a tied game.\n\tCan only guess one player per game.\n" + \
                                        "**!otstandings**\n\tDisplays the standings for the season-long OT prediction contest on this server." + \
                                        "**!otlist [NHL team or @User]**\n\tDisplays the guesses for the given team or user in today's OT Challenge.")
        if commands.check(is_KK_guild()):
            await ctx.message.channel.send("I'm Wes McCauley, the official referee of Keeping Karlsson. Here are some of the commands I respond to:\n" + \
                                            "**!help**\n\tDisplays this list of commands.\n" + \
                                            "**!ping or !pong**\n\tGets a response to check that bot is up.\n" + \
                                            "**!score [NHL team]**\n\tPosts the score of the given NHL team's game tonight. Accepts a variety of nicknames and abbreviations.\n" + \
                                            "**!ot [NHL team] [player name/number]**\n\tAllows you to predict a player to score the OT winner.\n\tMust be done between 5 minutes left" + \
                                            "in the 3rd period and the start of OT of a tied game.\n\tCan only guess one player per game.\n" + \
                                            "**!otstandings**\n\tDisplays the standings for the season-long OT prediction contest on this server." + \
                                            "**!otlist [NHL team or @User]**\n\tDisplays the guesses for the given team or user in today's OT Challenge.")

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

    async def reload_single_cog(self, ctx, cog):
        self.bot.reload_extension(f"Cogs.{cog}")
        await ctx.send(f"Cogs.{cog} successfully reloaded.")
        self.log.info(f"Reloaded Cogs.{cog}.")

    # Reloads a cog
    @commands.command(name="reload", aliases=["reboot", "restart", "update"])
    @commands.is_owner()
    @is_tech_channel()
    async def reload(self, ctx, cog):
        importlib.reload(Shared)

        if cog.lower() == "all":
            all_cogs = list(self.bot.cogs.keys())
            for cog in all_cogs:
                await self.reload_single_cog(ctx, cog)
            await ctx.send("All cogs successfully reloaded.")
            return

        await self.reload_single_cog(ctx, cog)

    # Error handler for reloading cog
    @reload.error
    async def reload_error(self, ctx, error):
        await ctx.send("Failure in reload: " + str(error))

    @tasks.loop(hours=24.0)
    async def rollover_loop(self):
        self.log.info("Rolling over date.")

        # Process the ot cog rollover method
        ot = self.bot.get_cog("OTChallenge")
        ot.processot(None)

        # TODO: ImportPickems cog, and run their Process Standings methods

        scoreboard = self.bot.get_cog("Scoreboard")
        async with scoreboard.messages_lock:
            scoreboard.messages = {}
            WritePickleFile(messages_datafile, scoreboard.messages) # reset file

    # Wait to start the first iteration of this loop at the appropriate time
    @rollover_loop.before_loop
    async def before_rollover_loop(self):
        current_time = datetime.utcnow()
        target_time = current_time

        if target_time.hour > ROLLOVER_HOUR_UTC:
            target_time += timedelta(days=1)
        target_time = target_time.replace(hour=ROLLOVER_HOUR_UTC, minute=0, second=0)

        self.log.info(f"Sleeping rollover loop for for {target_time-current_time}")

        await asyncio.sleep((target_time-current_time).total_seconds())

def setup(bot):
    bot.add_cog(Debug(bot))
