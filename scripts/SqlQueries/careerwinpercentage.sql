select FFname, per from 
(select FFname, s/(s+s2) as per from (select FFname, sum(wins) as s, sum(losses) as s2
 from (Users INNER JOIN Teams on Teams.ownerID=Users.FFid) where ownerID=initialOwner group by ownerID) as T1) as T2 order by per DESC

