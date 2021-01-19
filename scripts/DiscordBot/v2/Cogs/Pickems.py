from discord.ext import commands
from Shared import *

class Pickems(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

    # Nightly pickems loop

    # reaction add/remove listeners

    # ProcessPickems command

def setup(bot):
    bot.add_cog(Pickems(bot))
