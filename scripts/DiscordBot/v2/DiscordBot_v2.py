# Discord Libraries
import discord
from discord.ext import commands

# Python Libaries
from datetime import datetime
import logging
import sys

# Local Includes
sys.path.append("../..")
import Config

class Wes(commands.Bot):
    def __init__(self, *args, **kwargs):
        self.killed = False
        self.start_timestamp = datetime.utcnow()
        self.log = self.create_log("Bot")
        super(Wes, self).__init__(*args, **kwargs)

    # Creates or returns a log file of the given name.
    def create_log(self, name):    
        log = logging.getLogger(name)
        
        # Only create file handlers if the log doesn't have any, not on reload
        if not log.hasHandlers():
            log.setLevel(logging.DEBUG)

            # Create <Cog>.log log file
            fh = logging.FileHandler(f"Logs/{name}.log", "a+")
            fh.setLevel(logging.DEBUG)
            fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(filename)s %(lineno)d %(message)s"))
            log.addHandler(fh)

            # Create <Cog>.err log file
            fh = logging.FileHandler(f"Logs/{name}.err", "a+")
            fh.setLevel(logging.ERROR)
            fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(filename)s %(lineno)d %(message)s"))
            log.addHandler(fh)

        return log

    # Returns the days, hours, minutes, and seconds since the bot was last initialized
    def calculate_uptime(self):
        uptime = (datetime.utcnow() - self.start_timestamp)
        hours, remainder = divmod(uptime.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        return uptime.days, hours, minutes, seconds

intents = discord.Intents.default()
intents.members = True
intents.reactions = True

bot = Wes(command_prefix="!", case_insensitive=True, intents=intents, heartbeat_timeout = 120)

@bot.event
async def on_connect():
    bot.start_timestamp = datetime.utcnow()
    await bot.change_presence(activity=discord.Game(name="NHL '94"))
    await bot.user.edit(username="Wes McCauley") # avatar=fp.read()
    bot.log.info("Bot started.")

@bot.event
async def on_disconnect():
    days, hours, minutes, seconds = bot.calculate_uptime()
    bot.log.info(f"Bot disconnected after {days} day(s), {hours} hour(s), {minutes} minute(s), {seconds} seconds(s).")
    if not bot.killed:
        bot.run(Config.config["beta_discord_token"])

@bot.event
async def on_error(self, event, *args, **kwargs):
    bot.log.error("ERROR") # TODO: stacklevel=2)

# Remove default help command
bot.remove_command("help")

bot.load_extension("Cogs.Debug")
bot.load_extension("Cogs.Memes")
bot.load_extension("Cogs.OTH")
bot.load_extension("Cogs.KeepingKarlsson")
bot.load_extension("Cogs.Scoreboard")

bot.run(Config.config["beta_discord_token"])

# TODO: Uncomment
# "Hang" if bot was force-killed to prevent recreation by pm2
#if (bot.killed)
#    while True:
#        continue
