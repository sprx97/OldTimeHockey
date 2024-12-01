#!/bin/bash

# cd to the main scripts directory
cd /var/www/OldTimeHockey/scripts

# Find the current year and week
year=$(head -1 WeekVars.txt)
week=$(head -2 WeekVars.txt | tail -1)

# After week 5, start updating the woppa cup
if (( $week > 5 )); then
    python3 /var/www/OldTimeHockey/scripts/woppacup.py true
    echo "WoppaCup Update Complete!"
fi

# Update the weekly scores tables from fleaflicker
python3 /var/www/OldTimeHockey/scripts/UpdateTables.py
echo "UpdateTables Complete!"
python3 /var/www/OldTimeHockey/scripts/PullDailyScores.py
echo "PullDailyScores Complete!"

# Update the playoff odds json from fleaflicker starting in December
if (( $week > 8 )); then
    python3 /var/www/OldTimeHockey/scripts/PlayoffOdds/PlayoffOdds_OTH.py
    echo "PlayoffOdds Complete!"
fi

# Generate weekly stat dumps and post to Reddit
python3 /var/www/OldTimeHockey/scripts/RedditBot/WeeklyStatsPost.py
python3 /var/www/OldTimeHockey/scripts/RedditBot/PFLeadersPost.py
python3 /var/www/OldTimeHockey/scripts/RedditBot/RedditPostBot.py
echo "Reddit Post Complete!"

# Increment week variable
python3 /var/www/OldTimeHockey/scripts/IncrementWeek.py
echo "WeekVars Incremented!"

# Run weekly database copy
python3 /var/www/OldTimeHockey/scripts/backupdata.py
echo "Backup Complete!
