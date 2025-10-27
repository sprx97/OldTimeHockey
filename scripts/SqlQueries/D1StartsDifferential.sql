select t.name, SUM(me.num_players)-SUM(opp.num_players) as start_diff from Scoring as me
	INNER JOIN Scoring as opp on (me.game_id=opp.game_id AND me.scoring_period=opp.scoring_period)
    INNER JOIN Teams as t on (me.team_id=t.teamID and me.year=t.year)
where me.year=2025 and t.leagueID=12086
GROUP BY me.team_id, t.name
ORDER BY `start_diff` DESC