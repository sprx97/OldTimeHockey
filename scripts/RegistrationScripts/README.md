## Relegation script

### *Inputs / Resources:*

- `leaderboard.txt`
  - This content is a copy/paste of the contents of the https://roldtimehockey/leaderboard, with a headers column added manually. The headers are currently as follows (this can be copied for future years):
    - `rank	league	team	user	wins	losses	pf	pa	cr`
  - TODO: Ideally this could be pulled directly from the API, rather than needing to be copied / pasted.

- `d4_managers.txt`
  - This was copied from concini's r/oldtimehockey post regarding relegations. I literally just copied all D4 managers from his post. The code will just consider the first word in each line to be a manager's username, ignoring anything added after the first space.
  - TODO: Do this in a more structured workflow.
