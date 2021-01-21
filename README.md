# Welcome to OldTimeHockey
OldTimeHockey is a fantasy hockey superleague that was started via Reddit in 2013. It has since expanded to include its own [website](www.roldtimehockey.com) and [Discord server](https://discord.gg/47KRYxA) with bots and scripts in support. All of the code for these lives in this repository and is deployed by Spartan97/SPRX97. If you are interested in contributing or re-purposing, feel free to contact me on Discord (SPRX97#9662), [Reddit](www.reddit.com/u/sprx97), or [Github](www.github.com/Spartan97).

## List of Things That Exist in This Repository
**OldTimeHockey/react/&ast;:** Frontend code and markup for the website www.roldtimehockey.com  
**OldTimeHockey/node/&ast;:** Backend code to access the OldTimeHockey SQL database  
**OldTimeHockey/scripts/DiscordBot/&ast;:** Code for our Discord bot, Wes McCauley  
**OldTimeHockey/scripts/&ast;:** Code that scrapes the leagues on [Fleaflicker](www.fleaflicker.com/nhl) and updates the SQL database and posts weekly recaps to Reddit  
**OldTimeHockey/oth.sql:** A periodic dump of the full database  
**OldTimeHockey/crontab:** A periodic dump of the cron jobs that keep these scripts continually running  
**OldTimeHockey/*:** Instructions and scripts for setup and running parts of the project  

## Other Notes
- Python 3 is required for all scripts, 3.8+ for the DiscordBot_v2
- Non-exaustive list of pip installs: cssselect 1.1.0+, discord.py 1.5.1+, lxml 4.6.2+, pickle 0.7.5+, praw 7.1+, pymysql 1.0.2+
- The database is a standard mysql installation
- Everything is deployed from a DigitalOcean droplet running Ubuntu 18.04 x64 (soon to upgrade to 20.04)
- The droplet takes weekly backups in case of catastrophic failure
- Processes are managed using pm2 (site deployment, nodejs api, and Discord Bot)
