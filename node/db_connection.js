var http = require("http"),
    url = require("url"),
    mysql = require("mysql"),
    mysqlEscapeArray = require("mysql-escape-array"),
    fs = require("fs"),
    config = require("../config.json"),
    PythonShell = require("python-shell"),
	util = require("util")

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

// TODO: Only required until I upgrade node and use mysql2 package
// Replaces conn.query with an async-safe version that returns the value.
const async_query = util.promisify(conn.query).bind(conn);
async function makeSqlQuery(query) {
	const rows = await async_query(query);
	return `${JSON.stringify(rows)}`;
}

async function handleV2(request, response) {
	request_url = url.parse(request.url, true);
	path = request_url.pathname.substring(3); // trim /v2 off the front
	query = request_url.query;
	content = "{}"

	current_year = fs.readFileSync(config.srcroot + "scripts/WeekVars.txt").toString().split("\n")[0];
	current_week = fs.readFileSync(config.srcroot + "scripts/WeekVars.txt").toString().split("\n")[1];

	switch (path) {
		case "/getLeagues":
		{
			year_where = "";
			if (query.year !== undefined) year_where = `WHERE year=${query.year}`
			content = await makeSqlQuery(`SELECT id, year, tier, name FROM Leagues ${year_where}`)
		}
		break;

		case "/standings/advanced/playoff_odds":
		{
			if (query.year === undefined) query.year = current_year;
			if (query.week === undefined) query.week = current_week;
			try {
				content = fs.readFileSync(config.srcroot + `scripts/PlayoffOdds/data/${query.year}/${query.league}/${query.week - 1}.json`);
			} catch {
				console.log("Error reading Playoff Odds file.");
			}
		}
		break;

		case "/standings/advanced/xWins":
		{
			content = await makeSqlQuery("SELECT * FROM Teams limit 10");
		}
		break;

		default:
		{
			content = path; // Just echo the path for debugging purposes
		}
		break;
	}

	response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
	response.write(content);
	response.end();
}

http.createServer(async function(request, response) {
	path = url.parse(request.url).pathname;
	if (path.startsWith("/v2/")) {
		await handleV2(request, response);
		return;
	}

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
		sql = "SELECT * from (SELECT Leagues.id, Leagues.name, round(sum(abs(pointsFor)), 2) as PF, round(sum(abs(pointsFor))/(count(*)), 2) as avgPF, round(stddev(abs(pointsFor)), 2) as stddev from Leagues \
		       inner join Teams on (id=leagueID and Teams.year=Leagues.year) where Teams.year=" + mysql.escape(query.year) + " group by Leagues.name) as t order by PF desc";
	}
	else if(path == "/divisionleagues") {
		tierfilter = "";
		if (query.tiers) {
			tierfilter = " and tier in " + mysqlEscapeArray(query.tiers.split(",")).toString() + " ";
		}

		sql = "SELECT Leagues.name, Leagues.id from Leagues where year=" + mysql.escape(query.year) + tierfilter;
	}
	else if(path == "/leagueteams") {
                sql = "SELECT Teams.teamID as teamID, Teams.leagueID as leagueID, Teams.name as name, Users.FFname as FFname, Teams.wins as wins, Teams.losses as losses, Teams.ties as ties, Teams.isChamp as isChamp, Leagues.tier as tier, Teams.replacement as is_replacement \
                       from Teams INNER JOIN Users on ownerID=FFid INNER JOIN Leagues on (leagueID=id and Teams.year=Leagues.year) where leagueid=" + mysql.escape(query.id) + " and Teams.year=" + mysql.escape(query.year) + " ORDER BY wins DESC, losses ASC, pointsFor DESC";
	}
	else if (path == "/currenttier") {
		sql = "SELECT Leagues.tier, Users.FFname from Teams inner join Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) inner join Users on ownerID=FFid where Teams.year=" + mysql.escape(query.year) + " and replacement != 1";
	}
	else if (path == "/gettrophies") {
		sql = "SELECT Leagues.tier, Leagues.year, Users.FFname from Teams INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) INNER JOIN Users on ownerID=FFid where isChamp=1";
		if (!query.skipd4) sql += " and Leagues.tier != 4";
		if (query.year) sql += " and Team.year=" + mysql.escape(query.year);
		sql += " order by Leagues.tier ASC";
	}
	else if (path == "/getplayerinfo") {
		sql = "SELECT L.name as leaguename, L.tier, U.FFname, L.year \
		       from Teams T INNER JOIN Leagues L on (T.leagueID=L.id and T.year=L.year) LEFT OUTER JOIN Teams_post TP on T.teamID=TP.teamID INNER JOIN Users U on T.ownerID=U.FFid \
		       where T.ownerID=" + mysql.escape(query.ffid);
	}
	else if (path == "/leaders") {
            yearfilter = "";
            if (query.seasons) {
                yearfilter = "and Leagues.year in " + mysqlEscapeArray(query.seasons.split(",")).toString() + " ";
            }

            tierfilter = "";
            if (query.tiers) {
                tierfilter = "and tier in " + mysqlEscapeArray(query.tiers.split(",")).toString() + " ";
            }

            minseasons = "";
            if (query.minseasons && !isNaN(parseInt(query.minseasons))) {
                minseasons = "HAVING count(*) >= " + parseInt(query.minseasons) + " ";
            }

            if (query.year == "week") {
                sql = "SELECT Leagues.id as leagueID, Leagues.tier as tier, t1.teamID as teamID, Leagues.name as leaguename, t1.name as teamname, Users.FFname, Users.FFid, t1.currentWeekPF, round(t1.currentWeekPF + t1.pointsFor, 2) regTotal, \
                       round(IFNULL(tp1.pointsFor, 0) + t1.currentWeekPF, 2) as postTotal, t2.currentWeekPF as PA, round(t2.currentWeekPF + t1.pointsAgainst, 2) as regPATotal, round(IFNULL(tp1.pointsAgainst, 0) + t2.currentWeekPF, 2) as postPATotal \
                       from Teams as t1 inner join Leagues on (t1.leagueID=Leagues.id AND t1.year=Leagues.year) inner join Users on t1.ownerID=Users.FFid left outer join Teams_post as tp1 on (tp1.teamID=t1.teamID AND tp1.year=t1.year) \
                       LEFT JOIN Teams as t2 on (t1.CurrOpp=t2.teamID AND t1.year=t2.year) \
                       where Leagues.year=" + mysql.escape(year) + tierfilter + " order by t1.currentWeekPF";
            }
            else if (query.year == "careerp") {
                sql = "SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, \
                       round(PA/(wins+losses), 2) as avgPA, trophies, FFid from (select FFname, count(*) as Seasons, sum(Teams_post.wins) as wins, sum(Teams_post.losses) as losses, \
                       sum(Teams_post.pointsFor) as PF, sum(Teams_post.pointsAgainst) as PA, \
                       round(exp(sum(log(CASE \
                           WHEN isChamp = 0 THEN 1 \
                           WHEN (tier = 1 AND Teams.year = 2019) THEN isChamp*19 \
                           WHEN (tier = 2 AND Teams.year = 2019) THEN isChamp*17 \
                           WHEN (tier = 3 AND Teams.year = 2019) THEN isChamp*13 \
                           WHEN (tier = 4 AND Teams.year = 2019) THEN isChamp*11 \
                           WHEN (tier = 1 AND Teams.year != 2019) THEN isChamp*7 \
                           WHEN (tier = 2 AND Teams.year != 2019) THEN isChamp*5 \
                           WHEN (tier = 3 AND Teams.year != 2019) THEN isChamp*3 \
                           WHEN (tier = 4 AND Teams.year != 2019) THEN isChamp*2 END)))) as trophies, \
                      FFid \
                      from Teams_post inner join Teams on (Teams_post.teamID=Teams.teamID AND Teams_post.year=Teams.year) \
                      inner join Users on ownerID=FFid inner join Leagues on (Teams.leagueID=Leagues.id AND Teams.year = Leagues.year) \
                      where replacement != 1 " + yearfilter + tierfilter + "group by FFid " + minseasons + ") as T1 order by PF DESC";
            }
            else if (query.year == "career") {
                sql = "SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, \
                       round(PA/(wins+losses), 2) as avgPA, trophies, careerCR, FFid from (select FFname, count(*) as Seasons, \
                       sum(wins) as wins, sum(losses) as losses, sum(pointsFor) as PF, sum(pointsAgainst) as PA, \
                       round(exp(sum(log(CASE \
                           WHEN isChamp = 0 THEN 1 \
                           WHEN (tier = 1 AND Teams.year = 2019) THEN isChamp*19 \
                           WHEN (tier = 2 AND Teams.year = 2019) THEN isChamp*17 \
                           WHEN (tier = 3 AND Teams.year = 2019) THEN isChamp*13 \
                           WHEN (tier = 4 AND Teams.year = 2019) THEN isChamp*11 \
                           WHEN (tier = 1 AND Teams.year != 2019) THEN isChamp*7 \
                           WHEN (tier = 2 AND Teams.year != 2019) THEN isChamp*5 \
                           WHEN (tier = 3 AND Teams.year != 2019) THEN isChamp*3 \
                           WHEN (tier = 4 AND Teams.year != 2019) THEN isChamp*2 END)))) as trophies, \
                       round(100*sum(pointsFor)/sum(100.0*pointsFor/coachRating), 2) as careerCR, FFid \
                       from Teams inner join Users on ownerID=FFid inner join Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) where replacement != 1 and pointsFor >=0 " + yearfilter + tierfilter + "group by FFid " + minseasons + ") as T1 order by PF DESC";
            }
            else if (query.year[query.year.length-1] == "p") {
                year = mysql.escape(query.year.slice(0, -1));
                sql = "SELECT Leagues.id as leagueID, Teams.teamID as teamID, Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams_post.wins, Teams_post.losses, \
                       Teams_post.pointsFor, Teams_post.pointsAgainst, Teams.isChamp, Teams_post.seed, Leagues.tier, Users.FFid, Leagues.year \
                       from Teams_post INNER JOIN Teams on (Teams_post.teamID=Teams.teamID and Teams.year=Teams_post.year) INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams_post.year=Leagues.year) INNER JOIN Users on Teams.ownerID=Users.FFid \
                       where Leagues.year=" + mysql.escape(query.year) + tierfilter + " order by Teams_post.pointsFor DESC";
            }
            else { // just a single-year
                sql = "SELECT Leagues.id as leagueID, Teams.teamID as teamID, Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams.Wins, Teams.Losses, Teams.pointsFor, Teams.pointsAgainst, Teams.coachRating, \
                       isChamp, Leagues.tier, Users.FFid, Leagues.year \
                       from Teams INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) INNER JOIN Users on ownerID=FFid where Leagues.year=" + mysql.escape(query.year) + tierfilter + " order by pointsFor DESC";
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
		sql = "SELECT FFname, round(wins/(wins+losses), 3) as wpct, wins, losses, Leagues.name, Leagues.year \
                       from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) \
                       where replacement != 1 and wins > 0 and tier != 4 and Leagues.year != 2012 and Leagues.year != " + year + " order by wpct DESC, wins DESC";
	}
	else if (path == "/seasonwinsrecord") {
		sql = "SELECT FFname, wins, Leagues.name, Leagues.year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) where replacement != 1 and tier != 4 order by wins DESC";
	}
	else if (path == "/seasonpfrecord") {
		sql = "SELECT FFname, pointsFor, Leagues.name, Leagues.year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) where replacement != 1 and tier != 4 order by pointsFor DESC";
	}
	else if (path == "/seasoncoachratingrecord") {
		sql = "SELECT FFname, coachRating, Leagues.name, Leagues.year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) \
		       where replacement != 1 and pointsFor > 0 and tier != 4 and (Leagues.year != " + year + " or " + (week > 23 ? "true" : "false") + ") order by coachRating DESC";
	}
	else if (path == "/adp") {
		args = []
		args.push(query.year)
		if (query.tiers)
			args.push(query.tiers)

		PythonShell.PythonShell.run(config.srcroot + "scripts/ADP.py", {args: args}, function(err, results) {
			if (err)
				throw err;

			response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
			if (results[0] === ']') // empty response
			{
				response.write("{}");
				response.end();
			}
			else
			{
				response.write(results[0]);
				response.end();
			}
		});

		return;
	}

	limit = "";
	if (query.limit)
	{
		parsed = parseInt(query.limit);
		if (!isNaN(parsed))
		{
			limit = " LIMIT " + parsed;
		}
	}

	sql += limit; // Can add limit to any query, even though it really only makes sense for certain ones.
	console.log(path + " " + sql)

	conn.query(sql, function(err, result, fields) {
//		console.log(result)
		response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
		response.write("" + JSON.stringify(result));
		response.end();
	});
}).listen(8001, "0.0.0.0");
