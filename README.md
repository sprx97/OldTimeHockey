# Welcome to OldTimeHockey
OldTimeHockey is a fantasy hockey superleague that was started via Reddit in 2013. It has since expanded to include its own [website](www.roldtimehockey.com) and [Discord server](https://discord.gg/47KRYxA) with bots and scripts in support. All of the code for these lives in this repository and is deployed by SPRX97. If you are interested in contributing or re-purposing, feel free to contact me on Discord (SPRX97#9662), [Reddit](www.reddit.com/u/sprx97), or [Github](www.github.com/Spartan97).

## List of Things That Exist in This Repository
**OldTimeHockey/react/&ast;:** Frontend code and markup for the website www.roldtimehockey.com  
**OldTimeHockey/node/&ast;:** Backend code to access the OldTimeHockey SQL database   
**OldTimeHockey/scripts/&ast;:** Code that scrapes the leagues on [Fleaflicker](www.fleaflicker.com/nhl) and updates the SQL database and posts weekly recaps to Reddit  
**OldTimeHockey/oth.sql:** A periodic dump of the full database  
**OldTimeHockey/cron:** The cronjob that runs on my box to keep things going 
**OldTimeHockey/*:** Instructions and scripts for setup and running parts of the project  

## Check out my Discord Bot, Wes McCauley
- https://github.com/Spartan97/WesBot

## Other Notes
- Python 3 is required for all scripts
- Non-exaustive list of pip installs: cssselect 1.1.0+, lxml 4.6.2+, praw 7.1+, pymysql 1.0.2+
- The database is a standard mysql installation
- Everything is deployed from a DigitalOcean droplet running Ubuntu 18.04 x64 (maybe I'll upgrade to 22.04 eventually)
- The droplet takes weekly backups in case of catastrophic failure
- Processes are managed using pm2 (site deployment and nodejs api)
