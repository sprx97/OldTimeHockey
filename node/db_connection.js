var http = require("http"),
    url = require("url"),
    mysql = require("mysql2/promise"),
    fs = require("fs"),
    config = require("../shared/config.json")

// TODO: parameterized queries/refactor

// Connection pool to allow many connections
const pool = mysql.createPool({
	host: config.sql_hostname,
	user: config.sql_username,
	password: config.sql_password,
	database: config.sql_dbname,
	waitForConnections: true,
	connectionLimit: 100,
	queueLimit: 1000
});

async function makeSqlQuery(query, params=[]) {
	try {
		const [rows] = await pool.execute(query, params);

		// Round weird floating point numbers to 2 decimal places
		for (const row of rows) {
			for (const data in row) {
				if (typeof row[data] === 'number') {
					row[data] = Math.round(row[data] * 100) / 100;
				}
			}
		}

		return rows
	} catch (err) {
		console.error("SQL error: ", err);
		return {}
	}
}

async function handleV2(request, response) {
	request_url = url.parse(request.url, true);
	path = request_url.pathname.substring(3); // trim /v2 off the front
	query = request_url.query;
	content = "{}"

	current_year = fs.readFileSync(config.srcroot + "scripts/WeekVars.txt").toString().split("\n")[0];
	current_week = fs.readFileSync(config.srcroot + "scripts/WeekVars.txt").toString().split("\n")[1];

	switch (path) {
		case "/Sentinel":
		{
			content = JSON.stringify({ sentinel: fs.existsSync(config.srcroot + "Sentinel") });
		}
		break;

		case "/getLeagues":
		{
			year_where = "";
			yearparams = [];
			if (query.year !== undefined) {
				year_where = `WHERE year=?`;
				yearparams = [query.year];
			}
			content = await makeSqlQuery(`SELECT id, year, tier, name FROM Leagues ${year_where}`, yearparams)
		}
		break;

		case "/standings/advanced/playoff_odds":
		{
			if (query.year === undefined) query.year = current_year;
			if (query.week === undefined) query.week = current_week;
			query.fiftyfifty = query.fiftyfifty === "true";
			try {
				content = fs.readFileSync(config.srcroot + `scripts/PlayoffOdds/data/${query.year}/${query.league}${query.fiftyfifty ? "/fiftyfifty" : ""}/${query.week - 1}.json`);
			} catch {
				console.log("Error reading Playoff Odds file.");
			}
		}
		break;

		case "/standings/advanced/xWins":
		{
			content = await makeSqlQuery("SELECT * FROM Teams LIMIT 10");
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
	params = [];

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
		sql = `
			SELECT * from 
				(SELECT Leagues.id, Leagues.name, round(sum(abs(pointsFor)), 2) as PF, round(sum(abs(pointsFor))/(count(*)), 2) as avgPF, round(stddev(abs(pointsFor)), 2) as stddev from Leagues
		       		INNER JOIN Teams on (id=leagueID and Teams.year=Leagues.year)
					WHERE Teams.year=?
					GROUP BY Leagues.id, Leagues.name
				) as t
				ORDER BY PF desc`;
		params.push(query.year);
	}
	else if(path == "/divisionleagues") {
		sql = "SELECT Leagues.name, Leagues.id from Leagues where year=?"
		params.push(query.year);
		if (query.tiers) {
			const tiers = query.tiers.split(",");
			const placeholders = tiers.map(() => "?").join(",");
			sql += ` and tier in (${placeholders})`;
			params.push(...tiers);
		}
	}
	else if(path == "/leagueteams") {
        sql = `
			SELECT Teams.teamID as teamID, Teams.leagueID as leagueID, Teams.name as name, Users.FFname as FFname, Teams.wins as wins, Teams.losses as losses, Teams.ties as ties, 
				Teams.isChamp as isChamp, Leagues.tier as tier, (Teams.ownerID != Teams.initialOwner) as is_replacement from Teams
				INNER JOIN Users on ownerID=FFid
				INNER JOIN Leagues on (leagueID=id and Teams.year=Leagues.year)
				WHERE leagueID=? and Teams.year=?
				ORDER BY wins DESC, losses ASC, pointsFor DESC`;
		params = [query.id, query.year];
	}
	else if (path == "/currenttier") {
		sql = `
			SELECT Leagues.tier, Users.FFname from Teams
				INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
				INNER JOIN Users on ownerID=FFid
				WHERE Teams.year=? and initialOwner = ownerID`;
		params.push(query.year);
	}
	else if (path == "/gettrophies") {
		sql = `
			SELECT Leagues.tier, Leagues.year, Users.FFname from Teams 
			INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year) 
			INNER JOIN Users on ownerID=FFid 
			WHERE isChamp=1`;
		if (!query.skipd4)
			sql += " and Leagues.tier != 4";
		if (query.year) {
			sql += " and Team.year=?"
			params.push(query.year);
		}
		sql += " order by Leagues.tier ASC";
	}
	else if (path == "/getplayerinfo") {
		sql = `
			SELECT L.name as leaguename, L.tier, U.FFname, L.year from Teams T
				INNER JOIN Leagues L on (T.leagueID=L.id and T.year=L.year)
				LEFT OUTER JOIN Teams_post TP on T.teamID=TP.teamID
				INNER JOIN Users U on T.ownerID=U.FFid
				WHERE T.ownerID=" + mysql.escape(query.ffid)`;
	}
	else if (path == "/leaders") {
		yearfilter = "";
		yearparams = [];
		if (query.seasons) {
			const seasons = query.seasons.split(",");
			const placeholders = seasons.map(() => "?").join(",");
			yearfilter = `and Leagues.year in (${placeholders}) `;
			yearparams.push(...seasons);
		}

		tierfilter = "";
		tierparams = [];
		if (query.tiers) {
			const tiers = query.tiers.split(",");
			const placeholders = tiers.map(() => "?").join(",");
			tierfilter = `and tier in (${placeholders}) `;
			tierparams.push(...tiers);
		}

		minseasons = "";
		minseasonsparams = []
		if (query.minseasons && !isNaN(parseInt(query.minseasons))) {
			minseasons = "HAVING count(*) >= ? ";
			minseasonsparams.push(query.minseasons);
		}

		if (query.year == "week") {
			sql = `
				SELECT Leagues.id as leagueID, Leagues.tier as tier, t1.teamID as teamID, Leagues.name as leaguename, t1.name as teamname, Users.FFname, Users.FFid, 
					t1.currentWeekPF, round(t1.currentWeekPF + t1.pointsFor, 2) regTotal, round(IFNULL(tp1.pointsFor, 0) + t1.currentWeekPF, 2) as postTotal, t2.currentWeekPF as PA,
					round(t2.currentWeekPF + t1.pointsAgainst, 2) as regPATotal, round(IFNULL(tp1.pointsAgainst, 0) + t2.currentWeekPF, 2) as postPATotal from Teams as t1
					INNER JOIN Leagues on (t1.leagueID=Leagues.id AND t1.year=Leagues.year)
					INNER JOIN Users on t1.ownerID=Users.FFid left outer join Teams_post as tp1 on (tp1.teamID=t1.teamID AND tp1.year=t1.year)
					LEFT JOIN Teams as t2 on (t1.CurrOpp=t2.teamID AND t1.year=t2.year)
					WHERE Leagues.year=? ${tierfilter} order by t1.currentWeekPF`;
			params = [year];
			params = [...params, ...tierparams]
		}
		else if (query.year == "careerp") {
			sql = `
				SELECT FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2) as PF, round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA,
					round(PA/(wins+losses), 2) as avgPA, trophies, FFid from (select FFname, count(*) as Seasons, sum(Teams_post.wins) as wins, sum(Teams_post.losses) as losses,
					sum(Teams_post.pointsFor) as PF, sum(Teams_post.pointsAgainst) as PA,
					round(exp(sum(log(CASE
						WHEN isChamp = 0 THEN 1
						WHEN (tier = 1 AND Teams.year = 2019) THEN isChamp*23
						WHEN (tier = 2 AND Teams.year = 2019) THEN isChamp*19
						WHEN (tier = 3 AND Teams.year = 2019) THEN isChamp*17
						WHEN (tier = 4 AND Teams.year = 2019) THEN isChamp*13
						WHEN (tier = 1 AND Teams.year != 2019) THEN isChamp*11
						WHEN (tier = 2 AND Teams.year != 2019) THEN isChamp*7
						WHEN (tier = 3 AND Teams.year != 2019) THEN isChamp*5
						WHEN (tier = 4 AND Teams.year != 2019) THEN isChamp*3
						WHEN (tier = 5) THEN isChamp*2 END
					)))) as trophies, FFid from Teams_post 
					INNER JOIN Teams on (Teams_post.teamID=Teams.teamID AND Teams_post.year=Teams.year)
					INNER JOIN Users on ownerID=FFid
					INNER JOIN Leagues on (Teams.leagueID=Leagues.id AND Teams.year = Leagues.year)
					WHERE initialOwner = ownerID ${yearfilter} ${tierfilter}
					GROUP BY FFid ${minseasons}) as T1
					ORDER BY PF DESC`;
			params = [...yearparams, ...tierparams, ...minseasonsparams]
		}
		else if (query.year == "career") {
			sql = `
				SELECT FFname, seasons, wins, losses, ties, round((wins+.5*ties)/(wins+losses+ties), 3) as pct, round(PF, 2) as PF,
					round(PF/(wins+losses+ties), 2) as avgPF, round(PA, 2) as PA, round(PA/(wins+losses+ties), 2) as avgPA, trophies, careerCR, FFid
					from (select FFname, count(*) as Seasons, sum(wins) as wins, sum(losses) as losses, sum(ties) as ties,
					sum(pointsFor) as PF, sum(pointsAgainst) as PA,
					round(exp(sum(log(CASE
						WHEN isChamp = 0 THEN 1
						WHEN (tier = 1 AND Teams.year = 2019) THEN isChamp*23
						WHEN (tier = 2 AND Teams.year = 2019) THEN isChamp*19
						WHEN (tier = 3 AND Teams.year = 2019) THEN isChamp*17
						WHEN (tier = 4 AND Teams.year = 2019) THEN isChamp*13
						WHEN (tier = 1 AND Teams.year != 2019) THEN isChamp*11
						WHEN (tier = 2 AND Teams.year != 2019) THEN isChamp*7
						WHEN (tier = 3 AND Teams.year != 2019) THEN isChamp*5
						WHEN (tier = 4 AND Teams.year != 2019) THEN isChamp*3
						WHEN (tier = 5) THEN isChamp*2 END
					)))) as trophies, round(100*sum(pointsFor)/sum(100.0*pointsFor/coachRating), 2) as careerCR, FFid from Teams
					INNER JOIN Users on ownerID=FFid 
					INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
					WHERE initialOwner = ownerID and pointsFor >=0 ${yearfilter} ${tierfilter}
					GROUP BY FFid ${minseasons}) as T1
					ORDER BY PF DESC`;
			params = [...yearparams, ...tierparams, ...minseasonsparams]
		}
		else if (query.year[query.year.length-1] == "p") {
			year = query.year.slice(0, -1);
			sql = `
				SELECT Leagues.id as leagueID, Teams.teamID as teamID, Leagues.name as leaguename, Teams.name as teamname, Users.FFname, Teams_post.wins, Teams_post.losses,
					Teams_post.pointsFor, Teams_post.pointsAgainst, Teams.isChamp, Teams_post.seed, Leagues.tier, Users.FFid, Leagues.year from Teams_post
					INNER JOIN Teams on (Teams_post.teamID=Teams.teamID and Teams.year=Teams_post.year)
					INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams_post.year=Leagues.year)
					INNER JOIN Users on Teams.ownerID=Users.FFid
					WHERE Leagues.year=? ${tierfilter}
					ORDER BY Teams_post.pointsFor DESC`;
			params = [year];
			params = [...params, ...tierparams]
		}
		else { // just a single-year
			sql = `
				SELECT Leagues.id as leagueID, Teams.teamID as teamID, Leagues.name as leaguename, Teams.name as teamname, Users.FFname Teams.Wins, Teams.Losses, Teams.Ties,
					Teams.pointsFor, Teams.pointsAgainst, Teams.coachRating, isChamp, Leagues.tier, Users.FFid, Leagues.year from Teams
					INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
					INNER JOIN Users on ownerID=FFid
					WHERE Leagues.year=? ${tierfilter}
					ORDER BY pointsFor DESC`;
			params = [query.year];
			params = [...params, ...tierparams]
		}
	}
	else if (path == "/winsrecord") {
		sql = "SELECT FFname, SUM(wins) as w from Teams INNER JOIN Users on FFid=ownerID where initialOwner = ownerID GROUP BY ownerID ORDER BY w DESC";
	}
	else if (path == "/winpctrecord") {
		sql = `
			SELECT FFname, ROUND(wpct, 4) as wpct, total, w, l, t from (SELECT FFname, (w+.5*t)/(w+l+t) as wpct, (w+l+t) as total, w, l, t from
				(SELECT FFname, sum(wins) as w, sum(losses) as l, sum(ties) as t from 
				(Users INNER JOIN Teams on FFid=ownerID)
		       		WHERE initialOwner = ownerID group by ownerID) as T1) as T2 where total > 40 ORDER BY wpct desc`;
	}
	else if (path == "/pfrecord") {
		sql = "SELECT FFname, ROUND(SUM(pointsFor), 2) as PF from Teams INNER JOIN Users on FFid=ownerID where initialOwner = ownerID GROUP BY ownerID ORDER BY PF DESC";
	}
	else if (path == "/avgpfrecord") {
		sql = "SELECT FFname, ROUND(PF/total, 2) as avg, total from (SELECT FFname, SUM(pointsFor) as PF, (SUM(wins)+SUM(losses)+SUM(ties)) as total \
                       from Users INNER JOIN Teams on FFid=ownerID where initialOwner = ownerID GROUP BY ownerID) as T1 where total > 40 order by avg DESC";
	}
	else if (path == "/coachratingrecord") {
		sql = "SELECT FFname, careerCR, total from (SELECT FFname, ROUND(100*sum(pointsFor)/SUM(100.0*pointsFor/coachRating), 2) as careerCR, (SUM(wins)+SUM(losses)+SUM(ties)) as total \
				from Users INNER JOIN Teams on FFid=ownerID where initialOwner = ownerID and pointsFor > 0 group by ownerID) as T1 where total > 40 order by careerCR DESC";
	}
	else if (path == "/seasonwinpctrecord") {
		sql = `
			SELECT FFname, round((wins+.5*ties)/(wins+losses+ties), 3) as wpct, wins, losses, ties, Leagues.name, Leagues.year from Users
				INNER JOIN Teams on FFid=ownerID
				INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
				WHERE initialOwner = ownerID and wins > 0 and tier != 4 and Leagues.year != 2012 and Leagues.year != ? order by wpct DESC, wins DESC`;
		params = [year];
	}
	else if (path == "/seasonwinsrecord") {
		sql = `
			SELECT FFname, wins, Leagues.name, Leagues.year from Users
				INNER JOIN Teams on FFid=ownerID
				INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
				WHERE initialOwner = ownerID and tier != 4 order by wins DESC`;
	}
	else if (path == "/seasonpfrecord") {
		sql = `
			SELECT FFname, pointsFor, Leagues.name, Leagues.year from Users
				INNER JOIN Teams on FFid=ownerID
				INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
				WHERE initialOwner = ownerID and tier != 4 order by pointsFor DESC`;
	}
	else if (path == "/seasoncoachratingrecord") {
		sql = `
			SELECT FFname, coachRating, Leagues.name, Leagues.year from Users
				INNER JOIN Teams on FFid=ownerID
				INNER JOIN Leagues on (Teams.leagueID=Leagues.id and Teams.year=Leagues.year)
				WHERE initialOwner = ownerID and pointsFor > 0 and tier != 4 and (Leagues.year != ? or ?)
				ORDER BY coachRating DESC`;
		params = [year, week > 23 ? "true" : "false"];
	}
	else if (path == "/adp") {
		MAX_PICK = 253;
		if (!query.tiers) {
			query.tiers = "1,2,3,4,5";
		}

		const tiers = query.tiers.split(",");
		const placeholders = tiers.map(() => "?").join(",");


		const subQuery = `
			SELECT COUNT(PickNum) as NumDrafts from DraftPicks
				INNER JOIN Leagues on (DraftPicks.Year=Leagues.year and DraftPicks.LeagueId=Leagues.id) \
		        WHERE DraftPicks.Year=? AND PickNum=1 AND Leagues.tier in (${placeholders})`;
		const subResult = await makeSqlQuery(subQuery, [query.year, ...tiers]);
		const expected = subResult[0].NumDrafts;

		sql = `
			SELECT PlayerId, PlayerName, (SUM(PickNum) + 253*(?-COUNT(PickNum))) / ? as ADP, MIN(PickNum) as MinPick, MAX(PickNum) as MaxPick,COUNT(PickNum) as TimesDrafted, PlayerTeam, PlayerPositions from DraftPicks
				INNER JOIN Leagues on (DraftPicks.Year=Leagues.year and DraftPicks.LeagueId=Leagues.id)
				WHERE DraftPicks.Year=? AND Leagues.tier in (${placeholders})
				GROUP BY PlayerId, PlayerName, PlayerTeam, PlayerPositions
				ORDER BY ADP ASC`;
		params = [expected, expected, query.year, ...tiers];
	}

	if (query.limit)
	{
		sql += " LIMIT ? ";
		params.push(query.limit);
	}

	console.log(path + " " + sql)

	const result = await makeSqlQuery(sql, params);

	// console.log(result);
	response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
	response.write("" + JSON.stringify(result));
	response.end();
}).listen(8001, "0.0.0.0");
