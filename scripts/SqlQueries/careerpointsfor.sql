select FFname, s from (select FFname, sum(pointsFor) as s from (Users INNER JOIN Teams on Teams.ownerID=Users.FFid) where ownerID=initialOwner group by ownerID) as T1 order by s DESC

