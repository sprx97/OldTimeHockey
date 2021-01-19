# Discord Libraries
from discord.ext import commands

# Python Libraries
import logging

# Local Includes
from Shared import *

class Memes(WesCog):
    def __init__(self, bot):
        super().__init__(bot)

    @commands.command(name="fifi")
    @is_OTH_guild()
    async def fifi(self, ctx):
        await ctx.send("Aw yeah buddy we need way more Kevin “Fifi” Fiala up in this thread, all that animal does is rip shelfies buddy, " + \
                       "pops bottles pops pussies so keep your finger on that lamp light limpdick cause the forecast is goals. Fuck your cookie jar and your water bottles, " + \
                       "you better get quality rubbermaids bud cause she's gonna spend a lot of time hitting the fucking ice if Fifi has anything to say about it. " + \
                       "Blistering Wristers or fat clappers, this fuckin guy can't be stopped. If I had a choice of one attack to use to kill Hitler I would choose a " + \
                       "Kevin Fiala snipe from the top of the circle because you fucking know his evil dome would be bouncing off the end boards after that puck is loosed " + \
                       "like lightning from the blade of God's own CCM. I'd just pick up the phone and call Kevin Fiala at 1-800-TOP-TITS where he can be found earning his " + \
                       "living at the back of the goddamn net. The world record for a recorded sniper kill is 3,540m, but that's only because nobody has asked ya boi Fifi to " + \
                       "rip any wristers at ISIS yet. If i had three wishes, the first would be to live forever, the second would be for Kevin Fiala to live forever, " + \
                       "and the third would be for a trillion dollars so I could pay to watch ol Fifi Score top cheddar magic for all eternity.")

    @commands.command(name="laine")
    @is_OTH_guild()
    async def laine(self, ctx):
        await ctx.send("Yeah, fuck off buddy we absolutely need more Laine clips. Fuckin every time this kid steps on the ice someone scores. " + \
                       "kids fuckin dirt nasty man. Does fuckin ovi have 14 goals this season I dont fuckin think so bud. I'm fuckin tellin ya Patrik 'golden flow' " + \
                       "Laine is pottin 50 in '17 fuckin callin it right now. Clap bombs, fuck moms, wheel, snipe, and fuckin celly boys fuck")

    @commands.command(name="xfactor")
    @is_OTH_guild()
    async def xfactor(self, ctx):
        await ctx.send("I have studied tapes of him and I must disagree. While he is highly skilled, he does not have 'it' if you know what I mean. " + \
                       "That 'x-factor'. The 'above and beyond' trait.")

    @commands.command(name="petey")
    @is_OTH_guild()
    async def petey(self, ctx):
        await ctx.send("Kid might look like if Malfoy was a Hufflepuff but he plays like if Potter was a Slytherin the kids absolutely fucking nasty. " + \
                        "If there was a fourth unforgiveable curse it would be called petterssaucious or some shit because this kids dishes are absolutely team killing, " + \
                        "SHL, AHL, NHL it doesn't fucking matter 100 points to Pettersson because he's winning the House Cup, The Calder Cup, " + \
                        "The Stanley Cup and whatever fucking cup is in Sweden. Game Over.")

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.id == MINNE_USER_ID and " wes " in (message.content + " ").lower().replace(".", " "):
            await message.channel.send("<@" + str(MINNE_USER_ID) + "> watch your mouth. Just cuz you tell me to do something doesn't " + \
                                       "mean I'm going to do it. Being a keyboard tough guy making smart ass remarks doesn't " + \
                                       "make you funny or clever, just a coward hiding behind a computer")

def setup(bot):
    bot.add_cog(Memes(bot))
