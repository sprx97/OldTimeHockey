# Discord Libraries
from discord.ext import commands

# Python Libraries
import asyncio
from datetime import datetime, timedelta
import inspect

# Local Includes
from Shared import *

class OTChallenge(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.file_lock = asyncio.Lock()
    
    class OTException(discord.ext.commands.CommandError):
        def __init__(self, msg):
            self.message = msg

    # TODO: !processot

    # TODO: PrintOTStandings(ctx, show_full)

    @commands.command(name="ot")
    async def ot(self, ctx, team, *guess_player):
        if team == "standings":
            show_full = len(guess_player) > 0 and guess_player[0] == "full"
            # PrintOTStandings(ctx, show_full)
            return
        
        # Check that we've been given a valid team
        if team.lower() not in team_map:
            raise NHLTeamNotFound(team)
        team = team_map[team.lower()]

        # If submitting a guess, must have a player
        if len(guess_player) == 0:
            raise commands.MissingRequiredArgument(inspect.Parameter("guess_player", inspect.Parameter.POSITIONAL_ONLY))
        guess_player = " ".join(guess_player)
        guess_player = sanitize(guess_player)

        # Get the games for today
        date = (datetime.now()-timedelta(hours=6)).strftime("%Y-%m-%d")
        root = make_api_call(f"https://statsapi.web.nhl.com/api/v1/schedule?date={date}&expand=schedule.linescore")
        if len(root["dates"]) <= 0:
            raise NoGamesTodayError(date)

        # validate that the selected team is playing
        games = root["dates"][0]["games"]
        found = False
        for game in games:
            game = make_api_call(f"https://statsapi.web.nhl.com{game['link']}")
            if game["gameData"]["teams"]["away"]["triCode"] == team or game["gameData"]["teams"]["home"]["triCode"] == team:
                found = True
                break

        if not found:
            raise TeamDoesNotPlayToday(team)

        # validate that the selected team is in an in-progress game
        if "In Progress" not in game["gameData"]["status"]["detailedState"]:
            raise self.OTException(f"{team} game is not currently in progress.")

        # validate that the game <2min left in the 3rd and is tied
        if game["liveData"]["linescore"]["teams"]["home"]["goals"] != game["liveData"]["linescore"]["teams"]["away"]["goals"]:
            raise self.OTException(f"{team} game is not tied.")

        mins_remaining = game["liveData"]["linescore"]["currentPeriodTimeRemaining"].split(":")[0]
        if mins_remaining == "END":
            mins_remaining = 0
        mins_remaining = int(mins_remaining)
        if game["liveData"]["linescore"]["currentPeriod"] != 3 or mins_remaining >= OT_CHALLENGE_BUFFER_MINUTES:
            raise self.OTException(f"{team} game is not in the final {OT_CHALLENGE_BUFFER_MINUTES} minutes of the 3rd.")

        # validate that the selected team has a player of the selected number
        found = 0
        for pid in game["gameData"]["players"].keys():
            player = game["gameData"]["players"][pid]
            if (player["lastName"].lower() == guess_player.lower() or player["fullName"].lower == guess_player.lower() or str(player["primaryNumber"]) == guess_player) and player["currentTeam"]["triCode"] == team:
                found += 1

        # Ensure only one player was found on this team
        if found == 0:
            raise self.OTException(f"{team} does not have player {guess_player}.")
        if found > 1:
            raise self.OTException(f"{team} has multiple players matching {guess_player}. Try using full name or jersey number instead.")

        # store the user, server, the gameid, and the player they chose, overwriting previous choices if applicable
        game_id = game["gamePk"]
        guild = ctx.guild.id
        user = ctx.author.id

        # Save the user's guess to the file, locking to prevent from being overwritten
        async with self.file_lock:
            guesses = LoadPickleFile(ot_datafile)
            guesses[(game_id, guild, user)] = (team, player["id"])
            WritePickleFile(ot_datafile, guesses)

        confirmation = f"{ctx.author.display_name} selects {player['fullName']} for the OT GWG."
        self.log.info(confirmation)
        await ctx.send(confirmation)

    @ot.error
    async def ot_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage:\n\t!ot standings\n\t!ot [NHL team] [Player number/lastname]")
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

def setup(bot):
    bot.add_cog(OTChallenge(bot))
