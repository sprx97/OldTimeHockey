# Discord Libraries
from discord.ext import commands

# Python Libraries
import asyncio
from datetime import datetime, timedelta

# Local Includes
from Shared import *

class OTChallenge(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.guesses_lock = asyncio.Lock()
        self.guesses = LoadPickleFile(ot_datafile)
        self.standings = LoadPickleFile(otstandings_datafile)
    
    class OTException(discord.ext.commands.CommandError):
        def __init__(self, msg):
            self.message = msg

    # Lists the days OT Challenge guesses for a user or team
    @commands.command(name="otlist")
    async def otlist(self, ctx, arg):
        arg = arg.lower()
        if arg in team_map:
            await ctx.send(f"Team: {team_map[arg]}")

        elif "@" in arg:
            if len(ctx.message.mentions) > 0:
                await ctx.send(f"User: {ctx.message.mentions[0].id}")

    @otlist.error
    async def otlist_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage:\n\t!otstandings\n\t!ot [Team] [Player Name/Number]\n\t!otlist [Team or @User]")
        elif isinstance(error, NHLTeamNotFound):
            await ctx.send(error.message)
        # TODO: Error for no guesses found for team or no guesses found for user
        else:
            await ctx.send(error)

    # Displays the OT Challenge standings for this server
    @commands.command(name="otstandings")
    async def otstandings(self, ctx, show_full=None):
        show_full = (show_full == "full")

        guild = ctx.guild.id

        if guild not in self.standings:
            raise self.OTException("No standings for this server.")

        # Standings message header
        standings = self.standings[guild]
        msg = "**OT Challenge Standings**\n"
        if show_full:
            msg +=  "``Full Standings\n"
        else:
            msg += "``Top-10 Standings\n"
        msg += "Rank|User        | Wins | Guesses\n"
        msg += "----|------------|------|--------\n"

        # Standings message body loop
        count = 0
        last_user = None
        last_rank = 0
        for user in standings:
            count += 1
            rank = count # may be modified over the course of this loop, so reset it every time through

            # Only display rank for the first user if multiple in a row are tied
            if last_user and standings[user][0] == standings[last_user][0] and standings[user][1] == standings[last_user][1]:
                rank = ""
            else:
                last_rank = rank

            last_user = user

            if not show_full and last_rank > 10:
                if user != ctx.author.id: # Skip users outside the top 10 to save space
                    continue
                else:
                    rank = last_rank # Show the rank for the invoker if they're outside the top-10

            user_name = self.bot.get_guild(guild).get_member(user).display_name + "              "
            wins = str(standings[user][0]) + "      "
            guesses = str(standings[user][1]) + "        "

            rank = str(rank) + "   "
            rank = rank[:3]
            user_name = user_name[:12]

            # Stupid hack to adjust length for usernames containing emoji
            # because they aren't propertly monospaced by discord's markdown
            emoji_count = 0
            for char in user_name:
                if ord(char) > 100000: # Emoji or unicode
                    emoji_count += 1
            user_name = user_name[:12-int(1.75*emoji_count)]
            
            wins = wins[:6]
            guesses = guesses[:8]

            msg += " " + str(rank) + "|" + user_name + "|" + wins + "|" + guesses + "\n"

        # Standings message footer
        msg += "``"
        msg += "*Standings bulk updated overnight"
        if not show_full:
            msg += "\n*'!otstandings full' to display full standings"

        await ctx.send(msg)

    @commands.command(name="processot")
    async def processot(self, ctx):
        # This may be a bit slow, since I'm re-loading the game for each
        # guess, instead of processing all guesses for a game, but it shouldn't matter.
        for guess in self.guesses:
            game = guess[0]
            guild = guess[1]
            user = guess[2]
            user_name = self.bot.get_guild(guild).get_member(user).display_name
            team = self.guesses[guess][0]
            player = self.guesses[guess][1]

            # Load boxscore from NHL.com and pull the scorer of the last goal in this game.
            playbyplay = make_api_call(f"https://statsapi.web.nhl.com/api/v1/game/{game}/feed/live")

            # Check that the GWG play exists -- may trigger in a 0-0 shootout game
            try:
                goal = playbyplay["liveData"]["plays"]["scoringPlays"][-1]
                goal = playbyplay["liveData"]["plays"]["allPlays"][goal]
            except:
                self.log.info(f"Failed to find GWG play. {str(e)}") # Just log, don't raise exception so we continue processing
                continue

            # Check that game didn't end late in the 3rd or in a shootout
            if goal["about"]["periodType"] != "OVERTIME":
                self.log.info(f"{team} game did not end in OT.") # Just log, don't raise exception so we continue processing
                continue

            # See if the player was guessed correctly
            correct = 0
            scorer_name = goal["players"][0]["player"]["fullName"]
            if goal["team"]["triCode"] == team and goal["players"][0]["player"]["id"] == player:
                self.log.info(f"{user_name} CORRECT for {team} {scorer_name}")
                correct = 1
            else:
                self.log.info(f"{user_name} INCORRECT for {team} {scorer_name}")

            # Update the standings for this user
            if guild not in self.standings:
                self.standings[guild] = {}

            if user not in self.standings[guild]:
                self.standings[guild][user] = [0, 0]

            self.standings[guild][user][0] += correct
            self.standings[guild][user][1] += 1

        for g in self.standings:
            self.standings[g] = {k  : v for k, v in sorted(self.standings[g].items(), key=lambda item: item[1][1])} # first sort by ascending number of guesses, which is used as a tiebreaker
            self.standings[g] = {k  : v for k, v in sorted(self.standings[g].items(), key=lambda item: item[1][0], reverse=True)} # then sort by number of correct answers

        # Write updated standings and cleared guesses file
        async with self.guesses_lock:
            WritePickleFile(otstandings_datafile, self.standings)
            self.guesses = {}
            WritePickleFile(ot_datafile, self.guesses)

        # Send a confirmation message if this was manually triggered
        self.log.info("Finished processing ot guesses.")
        if ctx:
            await ctx.send("Finished processing ot guesses.")

    @commands.command(name="ot")
    @commands.cooldown(3, 120.0, commands.BucketType.member) # 3 uses per 120 seconds per user
    async def ot(self, ctx, team, guess_player, *extra):
        team = team.replace("[", "").replace("]", "")
        
        # Check that we've been given a valid team
        if team.lower() not in team_map:
            raise NHLTeamNotFound(team)
        team = team_map[team.lower()]

        if len(extra) > 0:
            guess_player += " " + " ".join(extra)
        guess_player = guess_player.replace("[", "").replace("]", "")
        guess_player = sanitize(guess_player)

        # Get the games for today
        date = (datetime.utcnow()-timedelta(hours=ROLLOVER_HOUR_UTC)).strftime("%Y-%m-%d")
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

        game_type = game["gameData"]["game"]["type"]
        current_period = int(game["liveData"]["linescore"]["currentPeriod"])
        mins_remaining = game["liveData"]["linescore"]["currentPeriodTimeRemaining"].split(":")[0]
        if mins_remaining == "END":
            mins_remaining = 0
        mins_remaining = int(mins_remaining)

        is_late_3rd = (mins_remaining < OT_CHALLENGE_BUFFER_MINUTES and current_period == 3)
        is_pre_OT = (current_period > 3 and ((mins_remaining == 5 and game_type == "R") or (mins_remaining == 20 and game_type == "P")))

        if not is_late_3rd or not is_pre_OT:
            raise self.OTException(f"{team} game is not in the final {OT_CHALLENGE_BUFFER_MINUTES} minutes of the 3rd or an OT intermission.")

        # validate that the selected team has a player of the selected number
        found_player = None
        for pid in game["gameData"]["players"].keys():
            player = game["gameData"]["players"][pid]
            if (sanitize(player["lastName"].lower()) == guess_player.lower() or sanitize(player["fullName"].lower()) == guess_player.lower() or str(player["primaryNumber"]) == guess_player) and player["currentTeam"]["triCode"] == team:
                if found_player != None:
                    raise self.OTException(f"{team} has multiple players matching {guess_player}. Try using full name or jersey number instead.")
                found_player = player

        # Ensure only one player was found on this team
        if found_player == None:
            raise self.OTException(f"{team} does not have player {guess_player}.")

        # store the user, server, the gameid, and the player they chose, overwriting previous choices if applicable
        game_id = game["gamePk"]
        guild = ctx.guild.id
        user = ctx.author.id

        # Save the user's guess to the file, locking to prevent from being overwritten
        self.guesses[(game_id, guild, user)] = (team, found_player["id"])
        async with self.guesses_lock:
            WritePickleFile(ot_datafile, self.guesses)

        confirmation = f"{ctx.author.display_name} selects {found_player['fullName']} for the OT GWG."
        self.log.info(confirmation)
        await ctx.send(confirmation)

    @ot.error
    async def ot_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage:\n\t!otstandings\n\t!ot [Team] [Player Name/Number]\n\t!otlist [Team or @User]")
        elif isinstance(error, commands.CommandOnCooldown):
            await ctx.send(f"Two-minute penalty for spamming {get_emoji('parros')}")
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
