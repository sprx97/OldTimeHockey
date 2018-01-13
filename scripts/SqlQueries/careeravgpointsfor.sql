select FFname, wper from (select FFname, s/(w+l) as wper from 
(select FFname, sum(pointsFor) as s, sum(wins) as w, sum(losses) as l from 
(Users INNER JOIN Teams on Teams.ownerID=Users.FFid) where replacement=0 group by ownerID) as T1)
as T2 order by wper DESC

