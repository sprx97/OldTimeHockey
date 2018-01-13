select FFname, s from (select FFname, sum(wins) as s from (Users INNER JOIN Teams on Teams.ownerID=Users.FFid) where replacement=0 group by ownerID) as T1 order by s DESC

