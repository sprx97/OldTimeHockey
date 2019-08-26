var http = require('http'), 
    url = require('url'), 
    mysql = require('mysql'),
    fs = require('fs'),
    config = require("../config.json")

var conn = mysql.createConnection({
	host: config.sql_hostname,
	user: config.sql_username,
	password: config.sql_password,
	database: config.sql_dbname
});

conn.connect(function(err) {
	if(err) throw err;
	console.log("Connected!");
});

http.createServer(function(request, response) {
	path = url.parse(request.url).pathname;
	query = url.parse(request.url, true).query;
	year = fs.readFileSync(config.srcroot + "scripts/WeekVars.txt").toString().split("\n")[0];
	week = fs.readFileSync(config.srcroot + "scripts/WeekVars.txt").toString().split("\n")[1];
	sql = "";

	if(path == "/getyear") {
		response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
		response.write(JSON.stringify(year));
		response.end();
		return;
	}
	else if(path == "/getweek") {
		response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
		response.write(JSON.stringify(week));
		response.end();
		return;
	}
	else if(path == "/leagueranks") {
		sql = "SELECT * from (SELECT Leagues.id, Leagues.name, round(sum(pointsFor), 2) as PF, round(sum(pointsFor)/(count(*)), 2) as avgPF from Leagues \
		       inner join Teams on id=leagueID where year=" + query.year + " group by Leagues.name) as t order by PF desc";
	}
	else if(path == "/divisionleagues") {
		sql = "SELECT Leagues.name, Leagues.id from Leagues where year=" + query.year + " AND tier=" + query.tier;
	}
	else if(path == "/leagueteams") {
		sql = "SELECT * from (Teams INNER JOIN Users on ownerID=FFid) where leagueID=" + query.id + " ORDER BY gamesBack ASC, pointsFor DESC";
	}
	else if (path == "/currenttier") {
		sql = "SELECT Leagues.tier, Users.FFname from Teams inner join Leagues on leagueID=id inner join Users on ownerID=FFid where year=" + query.year + " and replacement != 1";
	}
	else if (path == "/gettrophies") {
		sql = "SELECT Leagues.tier, Leagues.year, Users.FFname from Teams INNER JOIN Leagues on leagueID=id INNER JOIN Users on ownerID=FFid where isChamp=1";
		if (!query.skipd4) sql += " and Leagues.tier != 4";
		if (query.year != "") sql += " and year=" + query.year;
		sql += " order by Leagues.tier ASC"; 
	}
	else if (path == "/getplayerinfo") {
		sql = "SELECT L.name as leaguename, L.tier, U.FFname, L.year \
		       from Teams T INNER JOIN Leagues L on T.leagueID=L.id LEFT OUTER JOIN Teams_post TP on T.teamID=TP.teamID INNER JOIN Users U on T.ownerID=U.FFid \
		       where T.ownerID=" + query.ffid;
	}
	else if (path == "/leaders") {
		if (query.year == "week") {
			sql = "SELECT Leagues.id as leagueID, t1.teamID as teamID, Leagues.name as leaguename, t1.name as teamname, Users.FFname, Users.FFid, t1.currentWeekPF, round(t1.currentWeekPF + t1.pointsFor, 2) regTotal, \
			       round(IFNULL(tp1.pointsFor, 0) + t1.currentWeekPF, 2) as postTotal, t2.currentWeekPF as PA, round(t2.currentWeekPF + t1.pointsAgainst, 2) as regPATotal, round(IFNULL(tp1.pointsAgainst, 0) + t2.currentWeekPF, 2) as postPATotal \
			       from Teams as t1 inner join Users on t1.ownerID=Users.FFid inner join Leagues on t1.leagueID=Leagues.id left outer join Teams_post as tp1 on tp1.teamID=Users.FFid \
			       INNER JOIN Teams as t2 on t1.CurrOpp=t2.teamID \
			       where Leagues.year=" + year + " order by t1.currentWeekPF";
		}
		else if (query.year == "careerp") {
			sql = "SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, \
			       round(PA/(wins+losses), 2) as avgPA, trophies, FFid from (select FFname, count(*) as Seasons, sum(Teams_post.wins) as wins, sum(Teams_post.losses) as losses, \
			       sum(Teams_post.pointsFor) as PF, sum(Teams_post.pointsAgainst) as PA, sum(isChamp) as trophies, FFid \
			       from Teams_post inner join Teams on Teams_post.teamID=Teams.teamID inner join Users on ownerID=FFid where replacement != 1 group by FFid) as T1 order by PF DESC";
		}
		else if (query.year == "career") {
			sql = "SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, \
			       round(PA/(wins+losses), 2) as avgPA, trophies, careerCR, FFid from (select FFname, count(*) as Seasons, sum(wins) as wins, sum(losses) as losses, sum(pointsFor) as PF, \
			       sum(pointsAgainst) as PA, sum(isChamp) as trophies, round(100*sum(pointsFor)/sum(100.0*pointsFor/coachRating), 2) as careerCR, FFid \
			       from Teams inner join Users on ownerID=FFid where replacement != 1 and pointsFor >=0 group by FFid) as T1 order by PF DESC";
		}
		else if (query.year[query.year.length-1] == "p") {
			year = query.year.slice(0, -1);
			sql = "SELECT Leagues.id as leagueID, Teams.teamID as teamID, Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams_post.wins, Teams_post.losses, \
			       Teams_post.pointsFor, Teams_post.pointsAgainst, Teams.isChamp, Teams_post.seed, Leagues.tier \
			       from Teams_post INNER JOIN Teams on Teams_post.teamID=Teams.teamID INNER JOIN Leagues on Teams.leagueID=Leagues.id INNER JOIN Users on Teams.ownerID=Users.FFid \
			       where Leagues.year=" + year + " order by Teams_post.pointsFor DESC";
		}
		else {
			sql = "SELECT Leagues.id as leagueID, Teams.teamID as teamID, Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams.Wins, Teams.Losses, Teams.pointsFor, Teams.pointsAgainst, Teams.coachRating, isChamp, Leagues.tier \
			       from Teams INNER JOIN Leagues on leagueID=id INNER JOIN Users on ownerID=FFid where year=" + query.year + " order by pointsFor DESC";
		}
	}
	else if (path == "/winsrecord") {
		sql = "SELECT FFname, SUM(wins) as w from Teams INNER JOIN Users on FFid=ownerID where replacement != 1 GROUP BY ownerID ORDER BY w DESC";
	}
	else if (path == "/winpctrecord") {
		sql = "SELECT FFname, ROUND(wpct, 4) as wpct, total, w, l from (SELECT FFname, w/(w+l) as wpct, (w+l) as total, w, l \
		       from (SELECT FFname, sum(wins) as w, sum(losses) as l from (Users INNER JOIN Teams on FFid=ownerID) \
		       where replacement != 1 group by ownerID) as T1) as T2 where total > 40 ORDER BY wpct desc";
	}
	else if (path == "/pfrecord") {
		sql = "SELECT FFname, ROUND(SUM(pointsFor), 2) as PF from Teams INNER JOIN Users on FFid=ownerID where replacement != 1 GROUP BY ownerID ORDER BY PF DESC";
	}
	else if (path == "/avgpfrecord") {
		sql = "SELECT FFname, ROUND(PF/total, 2) as avg, total from (SELECT FFname, SUM(pointsFor) as PF, (SUM(wins)+SUM(losses)) as total \
                       from Users INNER JOIN Teams on FFid=ownerID where replacement != 1 GROUP BY ownerID) as T1 where total > 40 order by avg DESC";
	}
	else if (path == "/coachratingrecord") {
		sql = "SELECT FFname, careerCR, total from (SELECT FFname, ROUND(100*sum(pointsFor)/SUM(100.0*pointsFor/coachRating), 2) as careerCR, (SUM(wins)+SUM(losses)) as total \
				from Users INNER JOIN Teams on FFid=ownerID where replacement != 1 and pointsFor > 0 group by ownerID) as T1 where total > 40 order by careerCR DESC";
	}
	else if (path == "/seasonwinpctrecord") {
		sql = "SELECT FFname, round(wins/(wins+losses), 3) as wpct, wins, losses, Leagues.name, year \
                       from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID \
                       where replacement != 1 and wins > 0 and tier != 4 and year != 2012 and year != " + year + " order by wpct DESC, wins DESC";
	}
	else if (path == "/seasonwinsrecord") {
		sql = "SELECT FFname, wins, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID where replacement != 1 and tier != 4 order by wins DESC";
	}
	else if (path == "/seasonpfrecord") {
		sql = "SELECT FFname, pointsFor, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID where replacement != 1 and tier != 4 order by pointsFor DESC";
	}
	else if (path == "/seasoncoachratingrecord") {
		sql = "SELECT FFname, coachRating, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID \
		       where replacement != 1 and pointsFor > 0 and tier != 4 and (year != " + year + " or " + (week > 23 ? "true" : "false") + ") order by coachRating DESC";
	}

	conn.query(sql, function(err, result, fields) {
//		console.log(JSON.stringify(result));
		response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
		response.write("" + JSON.stringify(result));
		response.end();
	});
}).listen(8001, "0.0.0.0");
