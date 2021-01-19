# Discord Libraries
from discord.ext import commands, tasks

# Python Libraries
from datetime import datetime, timedelta
import logging

# Local Includes
from Shared import *

class KeepingKarlsson(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

        self.check_threads_loop.start()

    # Thread management loop
    @tasks.loop(hours=1.0)
    async def check_threads_loop(self):
        for channel in self.bot.get_channel(403805619175292930).text_channels: # TODO: text_channels[2:] and ASK_KEEPING_KARLSSON_CATEGORY_ID
            last_message = (await channel.history(limit=1).flatten())[0]
            last_message_delta = datetime.utcnow() - last_message.created_at

            # If the last message in the threads was more than a day ago and we aren't keeping it, lock it and mark for removal
            if last_message_delta > timedelta(minutes=30) and "tkeep" not in channel.name and last_message.author != self.bot.user:
                self.log.info(f"{channel.name} is stale.")
                # await channel.set_permissions(self.bot.get_guild(KK_GUILD_ID).get_role(BASIC_ROLE_ID), send_messages=False) # TODO: Uncomment this
                await channel.send("This thread has been locked due to 24h of inactivity, and will be deleted in 12 hours. Tag @zebra in #help-me if you'd like to keep the thread open longer.")
            # If the last message was more than 12 hours ago by this bot, delete the thread
            elif last_message_delta > timedelta(hours=12) and "tkeep" not in channel.name and last_message.author == self.bot.user:
                self.log.info(f"{channel.name} deleted.")
#                await channel.delete() # TODO: Uncomment this

        self.log.info("Thread check complete.")

    @check_threads_loop.before_loop
    async def before_check_threads_loop(self):
        await self.bot.wait_until_ready()

def setup(bot):
    bot.add_cog(KeepingKarlsson(bot))
