var http = require('http'), 
    url = require('url'), 
    mysql = require('mysql'),
    fs = require('fs')

var conn = mysql.createConnection({
	host: "104.236.183.115",
	user: "othuser",
	password: "othpassword",
	database: "OldTimeHockey"
});

conn.connect(function(err) {
	if(err) throw err;
	console.log("Connected!");
});

http.createServer(function(request, response) {
	var path = url.parse(request.url).pathname;
	var query = url.parse(request.url, true).query;

	if(path == "/getyear") {
		year = fs.readFileSync("/var/www/roldtimehockey/scripts/WeekVars.txt").toString().split("\n")[0]

		response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
		response.write(JSON.stringify(year));
		response.end();
	}
	else if(path == "/getweek") {
		week = fs.readFileSync("/var/www/roldtimehockey/scripts/WeekVars.txt").toString().split("\n")[1]

		response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
		response.write(JSON.stringify(week));
		response.end();
	}
	else if(path == "/leagueranks") {
		conn.query("SELECT * from (SELECT Leagues.name, round(sum(pointsFor), 2) as PF, round(sum(pointsFor)/(count(*)), 2) as avgPF from Leagues \
				inner join Teams on id=leagueID where year=" + query.year + " group by Leagues.name) as t order by PF desc", 
				function(err, result, fields) {
					response.write(JSON.stringify(result));
					response.end();
				});
	}
	else if(path == "/divisionleagues") {
		conn.query("SELECT Leagues.name, Leagues.id from Leagues where year=" + query.year + " AND tier=" + query.tier,
				function(err, result, fields) {
					response.write(JSON.stringify(result));
					response.end();
				});
	}
	else if(path == "/leagueteams") {
		conn.query("SELECT * from (Teams INNER JOIN Users on ownerID=FFid) where leagueID=" + query.id + " ORDER BY gamesBack ASC, pointsFor DESC",
				function(err, result, fields) {
					response.write(JSON.stringify(result));
					response.end();
				});
	}
	else if (path == "/currenttier") {
		conn.query("SELECT Leagues.tier, Users.FFname from Teams inner join Leagues on leagueID=id inner join Users on ownerID=FFid where year=" + query.year + " and replacement != 1",
				function(err, result, fields) {
					response.write(JSON.stringify(result));
					response.end();
				});
	}
	else if (path == "/gettrophies") {
		myquery = "SELECT Leagues.tier, Leagues.year, Users.FFname from Teams INNER JOIN Leagues on leagueID=id INNER JOIN Users on ownerID=FFid where isChamp=1";
		if (!query.skipd4) myquery += " and Leagues.tier != 4";
		if (query.year != "") myquery += " and year=" + query.year;
		myquery += " order by Leagues.tier ASC"; 
		conn.query(myquery, 
				function(err, result, fields) {
					response.write(JSON.stringify(result));
					response.end();
				});
	}
	else if(path == "/leaders") {
		myquery = "";
		if (query.year == "week") {
			year = fs.readFileSync("/var/www/roldtimehockey/scripts/WeekVars.txt").toString().split("\n")[0]
			myquery = "SELECT Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams.currentWeekPF, round(Teams.currentWeekPF + Teams.pointsFor, 2) regTotal, \
				  round(IFNULL(Teams_post.pointsFor, 0) + Teams.currentWeekPF, 2) as postTotal \
				  from Teams inner join Users on Teams.ownerID=Users.FFid inner join Leagues on Teams.leagueID=Leagues.id left outer join Teams_post on Teams_post.teamID=Users.FFid \
				  where Leagues.year=" + year + " order by currentWeekPF";
		}
		else if (query.year == "careerp") {
			myquery = "SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, \
				  round(PA/(wins+losses), 2) as avgPA, trophies, FFid from (select FFname, count(*) as Seasons, sum(Teams_post.wins) as wins, sum(Teams_post.losses) as losses, \
				  sum(Teams_post.pointsFor) as PF, sum(Teams_post.pointsAgainst) as PA, sum(isChamp) as trophies, FFid \
				  from Teams_post inner join Teams on Teams_post.teamID=Teams.teamID inner join Users on ownerID=FFid where replacement != 1 group by FFid) as T1 order by PF DESC";
		}
		else if (query.year == "career") {
			myquery = "SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, \
				  round(PA/(wins+losses), 2) as avgPA, trophies, careerCR, FFid from (select FFname, count(*) as Seasons, sum(wins) as wins, sum(losses) as losses, sum(pointsFor) as PF, \
				  sum(pointsAgainst) as PA, sum(isChamp) as trophies, round(100*sum(pointsFor)/sum(100.0*pointsFor/coachRating), 2) as careerCR, FFid \
				  from Teams inner join Users on ownerID=FFid where replacement != 1 and pointsFor >=0 group by FFid) as T1 order by PF DESC";
		}
		else if (query.year.charAt(query.year.length-1) == "p") {
			year = query.year.slice(0, -1);
			myquery = "SELECT Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams_post.wins, Teams_post.losses, \
				  Teams_post.pointsFor, Teams_post.pointsAgainst, Teams.isChamp, Teams_post.seed, Leagues.tier \
				  from Teams_post INNER JOIN Teams on Teams_post.teamID=Teams.teamID INNER JOIN Leagues on Teams.leagueID=Leagues.id INNER JOIN Users on Teams.ownerID=Users.FFid \
				  where Leagues.year=" + year + " order by Teams_post.pointsFor DESC";
		}
		else {
			myquery = "SELECT Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams.Wins, Teams.Losses, Teams.pointsFor, Teams.pointsAgainst, Teams.coachRating, isChamp, Leagues.tier \
				  from Teams INNER JOIN Leagues on leagueID=id INNER JOIN Users on ownerID=FFid where year=" + query.year + " order by pointsFor DESC";
		}
		conn.query(myquery, 
			function(err, result, fields) {
				response.write(JSON.stringify(result));
				response.end();
			});
	}
}).listen(8001, "0.0.0.0");
