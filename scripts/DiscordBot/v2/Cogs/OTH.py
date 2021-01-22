# Discord Libraries
from discord.ext import commands, tasks

# Python Libraries
import asyncio
from datetime import datetime, timedelta
import urllib.request, json

# Local Includes
from Shared import *

class OTH(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.trades_loop.start()
        self.inactives_loop.start()

######################## Cog-specific Exceptions ########################

    # Custom exception for an invalid fleaflicker username
    class UserNotFound(discord.ext.commands.CommandError):
        def __init__(self, user):
            self.message = f"Fleaflicker user {user} not found."

    # Custom exception for finding multiple matchups for a user
    class MultipleMatchupsFound(discord.ext.commands.CommandError):
        def __init__(self, user):
            self.message = f"Multiple matchups found for user {user}."

######################## Inactives ########################

    # Checks all OTH leagues for inactive managers and abandoned teams
    async def check_inactives(self):
        msg = ""
        leagues = get_leagues_from_database(CURRENT_YEAR)
        for league in leagues:
            standings = make_api_call(f"https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NHL&league_id={league['id']}")

            for team in standings["divisions"][0]["teams"]:
                # If there's no owners, mark as inactive
                if "owners" not in team:
                    msg += f"**{league['name']}**: *Unowned team: {team['name']}*\n"
                    continue

                # If there are owners, check if the primary one has been seen in the last MIN_INACTIVE_DAYS days
                last_seen = team["owners"][0]["lastSeenIso"]
                last_seen = datetime.strptime(last_seen, "%Y-%m-%dT%H:%M:%SZ")
                time_since_seen = datetime.utcnow()-last_seen
                if time_since_seen.days > MIN_INACTIVE_DAYS:
                    msg += f"**{league['name']}**: *Owner {team['owners'][0]['displayName']} not seen in last {MIN_INACTIVE_DAYS} days*\n"

        channel = self.bot.get_channel(TEST_GENERAL_CHANNEL_ID) # TODO: MODS_CHANNEL_ID
        await channel.send(msg)
        self.log.info("Inactives check complete.")

    # Check fleaflicker for recent trades
    @tasks.loop(hours=7*24.0) # weekly -- could check more often if MIN_INACTIVE_DAYS is set to smaller
    async def inactives_loop(self):
        await self.check_inactives()

    @inactives_loop.before_loop
    async def before_inactives_loop(self):
        await self.bot.wait_until_ready()
        
        # Sleep until midnight Sunday (Sat night) to call at the same time every week
        curr_time = datetime.now() # Should default to EST because that's where the server is located
        days_delta = timedelta((13-curr_time.weekday()) % 7)
        target_time = curr_time + days_delta
        target_time = target_time.replace(hour=0, minute=0, second=0, microsecond=0)
        delta = target_time-curr_time

        self.log.info("Sleeping inactives_loop for " + str(delta))
        await asyncio.sleep(delta.total_seconds())

    # Checks for any inactive OTH teams on FF
    @commands.command(name="inactives")
    @is_mods_channel()
    async def inactives(self, ctx):
        await self.check_inactives()

######################## Trade Review ########################

    # Formats a json trade into a discord embed
    def format_trade(self, league, trade):
        embed = discord.Embed(url=f"https://www.fleaflicker.com/nhl/leagues/{league['id']}/trades/{trade['id']}")
        embed.title = "Trade in " + league["name"]
        for team in trade["teams"]:
            players = ""
            for player in team["playersObtained"]:
                players += player["proPlayer"]["nameFull"] + "\n"

            # Display drops too
            if "playersReleased" in team:
                players += "**Dropping**\n"
                for player in team["playersReleased"]:
                    players += player["proPlayer"]["nameFull"] + "\n"

            embed.add_field(name=f"**{team['team']['name']}**", value=players)

        time_secs = int(trade["tentativeExecutionTime"])/1000.0
        embed.set_footer(text="Processes at " + datetime.fromtimestamp(time_secs).strftime("%A, %B %d, %Y %I:%M ET"))

        return embed

    # Function that checks all OTH fleaflicker leagues for new trades
    async def check_trades(self, verbose=False):
        # Find the list of trades that have already been posted so that we can ignore them.
        f = open("data/posted_trades.txt", "a+")
        f.seek(0)
        posted = [int(x.strip()) for x in f.readlines()]

        # Get the list of leagueIds for this year from the database
        leagues = get_leagues_from_database(CURRENT_YEAR)

        trades_channel = self.bot.get_channel(TEST_GENERAL_CHANNEL_ID) # TODO: Update to TRADE_REVIEW_CHANNEL_ID

        # Make Fleaflicker API calls to get pending trades in all the leagues
        count = 0
        for league in leagues:
            trades = make_api_call(f"https://www.fleaflicker.com/api/FetchTrades?sport=NHL&league_id={league['id']}&filter=TRADES_UNDER_REVIEW")

            # No trades in this league
            if "trades" not in trades:
                continue

            # Post each trade in this league
            for trade in trades["trades"]:
                if trade["id"] in posted:
                    continue

                trade_embed = self.format_trade(league, trade)
                await trades_channel.send(f"<@&{TRADEREVIEW_ROLE_ID}>", embed=trade_embed)
                count += 1
                
                # Append this trade ID to the list of trades already covered
                f.write(str(trade["id"]) + "\n")

        # Message if no trades were found
        if count == 0 and verbose:
            await trades_channel.send("No pending trades in any league.")

        f.close()

        self.log.info("Trades check complete.")

    # Check fleaflicker for recent trades
    @tasks.loop(hours=1.0)
    async def trades_loop(self):
        await self.check_trades()

    @trades_loop.before_loop
    async def before_trades_loop(self):
        await self.bot.wait_until_ready()

    @trades_loop.error
    async def trades_loop_error(self, error):
        await self.cog_command_error(None, error)

    @inactives_loop.error
    async def inactives_loop_error(self, error):
        await self.cog_command_error(None, error)

    # Checks for any new OTH trades
    @commands.command(name="trades")
    @is_tradereview_channel()
    async def trades(self, ctx):
        await self.check_trades(True)

######################## Matchup ########################

    # Posts the current matchup score for the given user
    @commands.command(name="matchup")
    @is_OTH_guild()
    async def matchup(self, ctx, user):
        matchup = get_user_matchup_from_database(user)
        if len(matchup) == 0:
            raise self.UserNotFound(user)
        if len(matchup) > 1:
            raise self.MultipleMatchupsFound(user)
        matchup = matchup[0]

        # Format a matchup embed to send
        msg = f"{matchup['name']} ({matchup['wins']}-{matchup['losses']}): **{matchup['PF']}**\n"
        msg += f"{matchup['opp_name']} ({matchup['opp_wins']}-{matchup['opp_losses']}): **{matchup['opp_PF']}**"
        link = f"https://www.fleaflicker.com/nhl/leagues/{matchup['league_id']}/scores/{matchup['matchup_id']}"
        embed = discord.Embed(title=msg, url=link)
        await ctx.send(embed=embed)

    @matchup.error
    async def matchup_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: !matchup <fleaflicker username>")
        elif isinstance(error, self.UserNotFound):
            await ctx.send(error.message)
        elif isinstance(error, self.MultipleMatchupsFound):
            await ctx.send(error.message)
        else:
            await ctx.send(error)

######################## Woppa Cup ########################

    # Posts the current woppacup matchup score for the given user
    @commands.command(name="woppacup")
    async def woppacup(self, ctx, user):
        # TODO: Find a way to make this work even though challonge
        #       API doesn't support multi-part tournaments. May
        #       make a comeback for 2020-2021 because no group stage.
        pass

    # TODO: Flairing users. Not necessary for v2 but nice to have.

def setup(bot):
    bot.add_cog(OTH(bot))
