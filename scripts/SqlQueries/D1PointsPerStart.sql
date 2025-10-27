select t.name, ROUND(t.pointsFor/SUM(me.num_players), 2) as pts_per_start from Scoring as me
    INNER JOIN Teams as t on (me.team_id=t.teamID and me.year=t.year)
where me.year=2025 and t.leagueID=12086
GROUP BY me.team_id, t.name
ORDER BY `pts_per_start` DESC;