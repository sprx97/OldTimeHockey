# Discord Libraries
from discord.ext import commands

# Python Libraries

# Local Includes
from Shared import *

class OTChallenge(WesCog):
    def __init__(self, bot):
        super().__init__(bot)
    
    # !processot

    @commands.command(name="ot")
    async def ot(self, ctx, team, *player):
        if team = "standings":
            # PrintOTStandings()
            return
        
        # If submitting a guess, must have a player
        if len(player) == 0:
            raise commands.MissingRequiredArgument

        player = " ".join(player)

        #    try:
        #         tokens = message.content.split(" ")
        #         if len(tokens) == 1:
        #             raise Exception("Wrong number of arguments:\n\t!ot <team> <player lastname/number>\n\t!ot standings (full)")
        #         if tokens[1] == "standings":
        #             show_full = len(tokens) > 2 and tokens[2] == "full"
        #             await PrintOTStandings(message.guild.id, message.channel, message.author.id, show_full)
        #             return
        #         if len(tokens) != 3:
        #             raise Exception("Wrong number of arguments:\n\t!ot <team> <player lastname/number>\n\t!ot standings (full)")
        #         guess_team = tokens[1].upper()
        #         if guess_team.lower() not in team_map:
        #             raise Exception("Team not recognized:\n\t!ot <team> <player lastname/number>\n\t!ot standings (full)")

        #         guess_player = tokens[2]

        #         date = (datetime.datetime.now()-datetime.timedelta(hours=6)).strftime("%Y-%m-%d")
        #         root = ParseFeeds.getFeed("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + date + "&endDate=" + date + "&expand=schedule.linescore")
        #         if len(root["dates"]) <= 0:
        #             raise Exception("No games found for today.")

        #         # validate that the selected team is playing
        #         games = root["dates"][0]["games"]
        #         teamFound = False
        #         for game in games:
        #             game = ParseFeeds.getFeed("https://statsapi.web.nhl.com" + game["link"])
        #             if game["gameData"]["teams"]["away"]["triCode"] == team_map[guess_team.lower()] or game["gameData"]["teams"]["home"]["triCode"] == team_map[guess_team.lower()]:
        #                 teamFound = True
        #                 break

        #         if not teamFound:
        #             raise Exception("Team " + guess_team + " not found in today's games.")

        #         # validate that the selected team is in an in-progress game
        #         if "In Progress" not in game["gameData"]["status"]["detailedState"]:
        #             raise Exception(guess_team + " game is not currently in progress.")

        #         # validate that the game <2min left in the 3rd and is tied
        #         if game["liveData"]["linescore"]["teams"]["home"]["goals"] != game["liveData"]["linescore"]["teams"]["away"]["goals"]:
        #             raise Exception(guess_team + " game is not tied.")

        #         mins_remaining = game["liveData"]["linescore"]["currentPeriodTimeRemaining"].split(":")[0]
        #         if mins_remaining == "END":
        #             mins_remaining = 0
        #         mins_remaining = int(mins_remaining)
        #         if game["liveData"]["linescore"]["currentPeriod"] != 3 or mins_remaining >= 5:
        #             raise Exception(guess_team + " game is not in the final 5 minutes of the 3rd.")

        #         # validate that the selected team has a player of the selected number
        #         playerFound = False
        #         for pid in game["gameData"]["players"].keys():
        #             player = game["gameData"]["players"][pid]
        #             if (player["lastName"].lower() == guess_player.lower() or str(player["primaryNumber"]) == guess_player) and player["currentTeam"]["triCode"] == team_map[guess_team.lower()]:
        #                 playerFound = True
        #                 break

        #         if not playerFound:
        #             raise Exception(guess_team + " does not have player " + guess_player + ".")

        #         # store the user, server, the gameid, and the player they chose, overwriting previous choices if applicable
        #         try:
        #             with open("ot.pickle", "rb+") as f:
        #                 try:
        #                     pickled = pickle.load(f)
        #                 except EOFError:
        #                     pickled = {}

        #                 gameid = game["gamePk"]
        #                 guild = message.guild.id
        #                 author = message.author.id

        #                 pickled[(gameid, guild, author)] = (guess_team, player["id"])

        #                 f.seek(0)
        #                 f.truncate()
        #                 pickle.dump(pickled, f)
        #         except Exception as e:
        #             raise Exception("Issue storing guess in local file. " + str(e))

        #         confirmation = message.author.display_name + " selects " + player["fullName"] + " for the OT GWG."
        #         print(confirmation)
        #         raise Exception(confirmation)

        #     except Exception as e:
        #         await message.channel.send(e)

    @ot.error
    async def ot_error(self, ctx, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage:\n\t!ot standings\n\t!ot <NHL team> <Player number/lastname")
        # elif isinstance(error, NHLTeamNotFound):
        #     await ctx.send(error.message)
        # elif isinstance(error, LinkError):
        #     await ctx.send(error.message)
        # elif isinstance(error, self.NoGamesTodayError):
        #     await ctx.send(error.message)
        # else:
        #     await ctx.send(error)

def setup(bot):
    bot.add_cog(OTChallenge(bot))
