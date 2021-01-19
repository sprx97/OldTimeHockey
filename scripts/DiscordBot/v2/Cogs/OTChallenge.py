from discord.ext import commands
from Shared import *

class OTChallenge(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

    # !ot

    # !processot

def setup(bot):
    bot.add_cog(OTChallenge(bot))
