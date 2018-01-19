<!--
	leaders.php
	Jeremy "sprx97" Vercillo
	9/18/14

	This page displays the leaguewide leaderboard. Should just be
	a massive sortable table.
-->

<html>
<title>Old Time Hockey!</title>

<?php include("header.html");?>
<link href="css/divisions.css" rel="stylesheet">
<link href="css/leaders.css" rel="stylesheet">
<script type="text/javascript" src="jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript" src="jquery/jquery.tablesorter.js"></script>
<script type="text/javascript">
	document.getElementById("leaders").className += "selected";

	$(document).ready(function() {
		$.tablesorter.addWidget({
			id: "numbering",
			format: function(table) {
				var c = table.config;
				$("tr:visible", table.tBodies[0]).each(function(i) {
					$(this).find('td').eq(0).text(i+1);
				})
			}
		});
		$("#currentweek").tablesorter({
			sortList:[[4,1],[5,1]],
			sortRestart:true,
			headers: {
				0: {sorter:false},
				1: {sortInitialOrder:'asc'},
				2: {sortInitialOrder:'asc'},
				3: {sortInitialOrder:'asc'},
				4: {sortInitialOrder:'desc'},
				5: {sortInitialOrder:'desc'},
			},
			widgets: ['numbering']
		});
		$("#playoffleaders").tablesorter({
			sortList:[[4, 1]],
			sortRestart:true,
			headers: {
				0: {sorter:false},
				1: {sortInitialOrder:'asc'},
				2: {sortInitialOrder:'asc'},
				3: {sortInitialOrder:'asc'},
				4: {sortInitialOrder:'desc'},
				5: {sortInitialOrder:'asc'},
				6: {sortInitialOrder:'desc'},
				7: {sortInitialOrder:'desc'},
			},
			widgets: ['numbering']
		});
		$("#yearlyleaders").tablesorter({
			sortList:[[6, 1]],
			sortRestart:true,
			headers: {
				0: {sorter:false},
				1: {sortInitialOrder:'asc'},
				2: {sortInitialOrder:'asc'},
				3: {sortInitialOrder:'asc'},
				4: {sortInitialOrder:'desc'},
				5: {sortInitialOrder:'desc'},
				6: {sortInitialOrder:'desc'},
				7: {sortInitialOrder:'desc'},
				8: {sortInitialOrder:'desc'},
			},
			widgets: ['numbering']
		});
		$("#careerleaders").tablesorter({
			sortList:[[6, 1]],
			sortRestart:true,
			textExtraction:
				function(node, table, cellIndex) {
					$minGP = 40; // can be changed, currently two full seasons

					if($(node).index() == 5 || $(node).index() == 7 || $(node).index() == 9 || $(node).index() == 10) {
						$GP = 0;
						$(node).siblings().each(function() {
							if($(this).index() == 3 || $(this).index() == 4) $GP += parseInt($(this).text(), 10);
						});
						if($GP >= $minGP) return (1000.0 * parseFloat($(node).text(), 10)).toString();
						else return $(node).text();
					}
					return $(node).text();
				},
			headers: {
				0: {sorter:false},
				1: {sortInitialOrder:'asc'},
				2: {sortInitialOrder:'desc'},
				3: {sortInitialOrder:'desc'},
				4: {sortInitialOrder:'desc'},
				5: {sortInitialOrder:'desc'},
				6: {sortInitialOrder:'desc'},
				7: {sortInitialOrder:'desc'},
				8: {sortInitialOrder:'desc'},
				9: {sortInitialOrder:'desc'},
				10:{sortInitialOrder:'desc'},
			},
			widgets: ['numbering'],
		});
                $("#careerplayoffs").tablesorter({
                        sortList:[[5, 1]],
                        sortRestart:true,
                        textExtraction:
                                function(node, table, cellIndex) {
                                        $minGP = 0; // no min GP for playoffs

                                        if($(node).index() == 5 || $(node).index() == 7 || $(node).index() == 9) {
                                                $GP = 0;
                                                $(node).siblings().each(function() {
                                                        if($(this).index() == 3 || $(this).index() == 4) $GP += parseInt($(this).text(), 10);
                                                });
                                                if($GP >= $minGP) return (1000.0 * parseFloat($(node).text(), 10)).toString();
                                                else return $(node).text();
                                        }
                                        return $(node).text();
                                },
                        headers: {
                                0: {sorter:false},
                                1: {sortInitialOrder:'asc'},
                                2: {sortInitialOrder:'desc'},
                                3: {sortInitialOrder:'desc'},
                                4: {sortInitialOrder:'desc'},
                                5: {sortInitialOrder:'desc'},
                                6: {sortInitialOrder:'desc'},
                                7: {sortInitialOrder:'desc'},
                                8: {sortInitialOrder:'desc'},
                                9: {sortInitialOrder:'desc'},
                        },
                        widgets: ['numbering'],
                });
	});
</script>


<?php
	$weekVars = fopen("/var/www/roldtimehockey/scripts/WeekVars.txt", "r");
	$curryear = trim(fgets($weekVars));
	fclose($weekVars);

        $con = mysqli_connect("localhost", "othuser", "othpassword", "OldTimeHockey");
        if(mysqli_connect_errno()) echo "Failed to connect to MySQL: " . mysqli_connect_errno();

        function printLeaders($YEAR) {
		global $con, $curryear;
		if($YEAR == "week") {
			echo "<table class=\"tablesorter\" id=\"currentweek\">";
			echo "<colgroup>";
			echo "<col width=\"5%\">";
			echo "<col width=\"15%\">";
			echo "<col width=\"20%\">";
			echo "<col width=\"15%\">";
			echo "<col width=\"10%\">";
			echo "<col width=\"10%\">";
			echo "</colgroup>";

			echo "<thead>";
			echo "<th></th>";
			echo "<th>League</th>";
			echo "<th>Team</th>";
			echo "<th>User</th>";
			echo "<th>PF Week</th>";
			echo "<th>PF Total</th>";

			echo "<tbody>";

			$teams = mysqli_query($con, "select Leagues.name, Teams.name, Users.FFname, Teams.currentWeekPF, round(Teams.currentWeekPF + Teams.pointsFor, 2) as total from Teams inner join Users on Teams.ownerID=Users.FFid inner join Leagues on Teams.leagueID=Leagues.id  where Leagues.year=" . $curryear . " order by currentWeekPF");
			while($team = mysqli_fetch_array($teams)) {
				echo "<tr class='" . $team[0] . "'>";
				echo "<td style=\"background-color:rgba(175, 175, 175, 1)\">" . $count . "</td>";
				echo "<td>" . $team[0] . "</td>";
				echo "<td>" . $team[1] . "</td>";
				echo "<td>" . $team[2] . "</td>";
				echo "<td>" . $team[3] . "</td>";
				echo "<td>" . $team[4] . "</td>";
				echo "</tr>";
			}

			echo "</tbody>";
		}
                else if($YEAR == "careerp") {
                        echo "<i>*Win Percentage and PF/PA Average sorts require 40GP minimum.<br></i>";
                        echo "<table class=\"tablesorter\" id=\"careerplayoffs\">";
                        echo "<colgroup>";
                        echo "<col width=\"6%\">";
                        echo "<col width=\"20%\">";
                        echo "<col width=\"8%\">";
                        echo "<col width=\"10%\">";
                        echo "<col width=\"10%\">";
                        echo "<col width=\"10%\">";
                        echo "<col width=\"10%\">";
                        echo "<col width=\"8%\">";
                        echo "<col width=\"10%\">";
                        echo "<col width=\"8%\">";
                        echo "</colgroup>";

                        echo "<thead>";
                        echo "<th></th>";
                        echo "<th>User</th>";
                        echo "<th style='font-size:14px;'>Yrs</th>";
                        echo "<th style='font-size:14px;'>Wins</th>";
                        echo "<th style='font-size:14px;'>Losses</th>";
                        echo "<th style='font-size:14px;'>PCT</th>";
                        echo "<th>PF</th>";
                        echo "<th style='font-size:12px;'>Avg</th>";
                        echo "<th>PA</th>";
                        echo "<th style='font-size:12px;'>Avg</th>";
                        echo "</thead>";

                        echo "<tbody>";
			$teams = mysqli_query($con, "select FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2), round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, round(PA/(wins+losses), 2) as avgPA, trophies from (select FFname, count(*) as Seasons, sum(Teams_post.wins) as wins, sum(Teams_post.losses) as losses, sum(Teams_post.pointsFor) as PF, sum(Teams_post.pointsAgainst) as PA, sum(isChamp) as trophies from Teams_post inner join Teams on Teams_post.teamID=Teams.teamID inner join Users on ownerID=FFid where replacement != 1 group by FFid) as T1 order by PF DESC");
                        while($team = mysqli_fetch_array($teams)) {
				$tier_query = mysqli_query($con, "select Leagues.name from Teams inner join Leagues on leagueID=id inner join Users on ownerID=FFid where year=" . $curryear . " and replacement!=1 and FFname='" . $team[0] . "'");
                                $tierclass = "notactive";
                                if($tier = mysqli_fetch_array($tier_query)) {
                                        $tierclass = "div3";
                                        if($tier[0] == 'Gretzky') $tierclass = "div1";
                                        if($tier[0] == 'Western' || $tier[0] == 'Eastern') $tierclass = "div2";
                                }
				echo "<tr class=\"" . $tierclass . "\">";
				echo "<td style=\"background-color:rgba(175, 175, 175, 1)\">" . $count . "</td>";
				echo "<td>" . $team[0];
				if($team[9] > 0) {
					echo " ";
					for($n = 0; $n < $team[9]; $n++) echo "<img src=\"images/trophy.png\" width=12px height=12px>";
				}
				echo "</td>";
				echo "<td>" . $team[1] . "</td>";
				echo "<td>" . $team[2] . "</td>";
				echo "<td>" . $team[3] . "</td>";
				echo "<td>" . $team[4] . "</td>";
				echo "<td>" . $team[5] . "</td>";
				echo "<td>" . $team[6] . "</td>";
				echo "<td>" . $team[7] . "</td>";
				echo "<td>" . $team[8] . "</td>";
				echo "</tr>";
			}
			echo "</tbody>";
			echo "</table>";
		}

		else if($YEAR == "career") {
			echo "<i>*Win Percentage, PF/PA Average, and Coach Rating sorts require 40GP minimum.<br></i>";
			echo "<table class=\"tablesorter\" id=\"careerleaders\">";
			echo "<colgroup>";
			echo "<col width=\"6%\">";
			echo "<col width=\"20%\">";
			echo "<col width=\"6%\">";
			echo "<col width=\"8%\">";
			echo "<col width=\"8%\">";
			echo "<col width=\"10%\">";
			echo "<col width=\"10%\">";
			echo "<col width=\"6%\">";
			echo "<col width=\"10%\">";
			echo "<col width=\"6%\">";
			echo "<col width=\"10%\">";
			echo "</colgroup>";

			echo "<thead>";
			echo "<th></th>";
			echo "<th>User</th>";
			echo "<th style='font-size:14px;'>Yrs</th>";
			echo "<th style='font-size:14px;'>Wins</th>";
			echo "<th style='font-size:14px;'>Losses</th>";
			echo "<th style='font-size:14px;'>PCT</th>";
			echo "<th>PF</th>";
			echo "<th style='font-size:12px;'>Avg</th>";
			echo "<th>PA</th>";
			echo "<th style='font-size:12px;'>Avg</th>";
			echo "<th>CR%</th>";
			echo "</thead>";

			echo "<tbody>";
			$teams = mysqli_query($con, "select FFname, seasons, wins, losses, round(wins/(wins+losses), 3) as pct, round(PF, 2), round(PF/(wins+losses), 2) as avgPF, round(PA, 2) as PA, round(PA/(wins+losses), 2) as avgPA, trophies, careerCR from (select FFname, count(*) as Seasons, sum(wins) as wins, sum(losses) as losses, sum(pointsFor) as PF, sum(pointsAgainst) as PA, sum(isChamp) as trophies, round(100*sum(pointsFor)/sum(100.0*pointsFor/coachRating), 2) as careerCR from Teams inner join Users on ownerID=FFid where replacement != 1 and pointsFor >=0 group by FFid) as T1 order by PF DESC");
			while($team = mysqli_fetch_array($teams)) {
				$tier_query = mysqli_query($con, "select Leagues.name from Teams inner join Leagues on leagueID=id inner join Users on ownerID=FFid where year=" . $curryear . " and replacement!=1 and FFname='" . $team[0] . "'");
				$tierclass = "notactive";
				if($tier = mysqli_fetch_array($tier_query)) {
					$tierclass = "div4";
					if($tier[0] == 'Yzerman' || $tier[0] == 'Jagr' || $tier[0] == 'Lemieux' || $tier[0] == 'Dionne' || $tier[0] == 'Howe') $tierclass = "div3";
					if($tier[0] == 'Brodeur' || $tier[0] == 'Roy' || $tier[0] == 'Hasek') $tierclass = "div2";
					if($tier[0] == 'Gretzky') $tierclass = "div1";
				}
				echo "<tr class=\"" . $tierclass . "\">";
				echo "<td style=\"background-color:rgba(175, 175, 175, 1)\">" . $count . "</td>";
				echo "<td>" . $team[0];
				if($team[9] > 0) {
					echo " ";
					for($n = 0; $n < $team[9]; $n++) echo "<img src=\"images/trophy.png\" width=12px height=12px>";
				}
				echo "</td>";
				echo "<td>" . $team[1] . "</td>";
				echo "<td>" . $team[2] . "</td>";
				echo "<td>" . $team[3] . "</td>";
				echo "<td>" . $team[4] . "</td>";
				echo "<td>" . $team[5] . "</td>";
				echo "<td>" . $team[6] . "</td>";
				echo "<td>" . $team[7] . "</td>";
				echo "<td>" . $team[8] . "</td>";
				echo "<td>" . $team[10] . "</td>";
				echo "</tr>";
			}
			echo "</tbody>";
			echo "</table>";
		}

		else if(substr($YEAR, -1) === "p") {
			echo "<table class=\"tablesorter\" id=\"playoffleaders\">";
			echo "<colgroup>";
			echo "<col width=\"5%\">";
			echo "<col width=\"12%\">";
			echo "<col width=\"18%\">";
			echo "<col width=\"15%\">";
			echo "<col width=\"10%\">";
			echo "<col width=\"10%\">";
			echo "<col width=\"9%\">";
			echo "<col width=\"9%\">";
//			echo "<col width=\"10%\">"; // (Coach %)
			echo "</colgroup>";

			echo "<thead>";
			echo "<th></th>";
			echo "<th>League</th>";
			echo "<th>Team</th>";
			echo "<th>User</th>";
			echo "<th>Wins</th>";
			echo "<th>Losses</th>";
			echo "<th>PF</th>";
			echo "<th>PA</th>";
			echo "</thead>";

			echo "<tbody>";
			$teams = mysqli_query($con, "SELECT Leagues.name, Teams.name, Users.FFname, Teams_post.wins, Teams_post.losses, Teams_post.pointsFor, Teams_post.pointsAgainst, Teams.isChamp, Teams_post.seed from Teams_post INNER JOIN Teams on Teams_post.teamID=Teams.teamID INNER JOIN Leagues on Teams.leagueID=Leagues.id INNER JOIN Users on Teams.ownerID=Users.FFid where Leagues.year=" . substr($YEAR, 0, -1) . " order by Teams_post.pointsFor DESC");
			while($team = mysqli_fetch_array($teams)) {
				echo "<tr class='" . $team[0] . "'>";
				echo "<td style=\"background-color:rgba(175, 175, 175, 1)\">" . $count . "</td>";
				echo "<td>" . $team[0];
				if($team[7]) echo " <img src=\"images/trophy.png\" width=12px height=12px>";
				echo "</td>";
				echo "<td>(" . $team[8] . ") " . $team[1] . "</td>";
				echo "<td>" . $team[2] . "</td>";
				echo "<td>" . $team[3] . "</td>";
				echo "<td>" . $team[4] . "</td>";
				echo "<td>" . $team[5] . "</td>";
				echo "<td>" . $team[6] . "</td>";
				echo "</tr>";
			}
			echo "</tbody>";
			echo "</table>";
		}

		else {
			echo "<table class=\"tablesorter\" id=\"yearlyleaders\">";
	                echo "<colgroup>";
			echo "<col width=\"5%\">";
	                echo "<col width=\"12%\">";
	                echo "<col width=\"18%\">";
	                echo "<col width=\"15%\">";
	                echo "<col width=\"10%\">";
	                echo "<col width=\"10%\">";
	                echo "<col width=\"9%\">";
	                echo "<col width=\"9%\">";
	                echo "<col width=\"10%\">";
	                echo "</colgroup>";

			echo "<thead>";
			echo "<th></th>";
			echo "<th>League</th>";
			echo "<th>Team</th>";
			echo "<th>User</th>";
			echo "<th>Wins</th>";
			echo "<th>Losses</th>";
			echo "<th>PF</th>";
			echo "<th>PA</th>";
			echo "<th>CR%</th>";
			echo "</thead>";

			echo "<tbody>";
			$teams = mysqli_query($con, "SELECT Leagues.name, Teams.name, Users.FFname, Teams.Wins, Teams.Losses, Teams.pointsFor, Teams.pointsAgainst, Teams.coachRating, isChamp from Teams INNER JOIN Leagues on leagueID=id INNER JOIN Users on ownerID=FFid where year=" . $YEAR . " order by pointsFor DESC");
			while($team = mysqli_fetch_array($teams)) {
				echo "<tr class='" . $team[0] . "'>";
				echo "<td style=\"background-color:rgba(175, 175, 175, 1)\">" . $count . "</td>";
				echo "<td>" . $team[0];
				if($team[8]) echo " <img src=\"images/trophy.png\" width=12px height=12px>";
				echo "</td>";
				echo "<td>" . $team[1] . "</td>";
				echo "<td>" . $team[2] . "</td>";
				echo "<td>" . $team[3] . "</td>";
				echo "<td>" . $team[4] . "</td>";
				echo "<td>" . $team[5] . "</td>";
				echo "<td>" . $team[6] . "</td>";
				echo "<td>" . $team[7] . "%</td>";
				echo "</tr>";
			}
			echo "</tbody>";
			echo "</table>";
		}
		echo "<br>";
	}
?>

<body><center>

<div style="margin:10px">
<form method="POST" style="margin:-7px 0px;">
<select name="year" onchange="this.form.submit()">
	<option value="2012">2012-2013 Regular Season</option>
	<option value="2012p">2012-2013 Playoffs</option>
	<option value="2013">2013-2014 Regular Season</option>
	<option value="2013p">2013-2014 Playoffs</option>
	<option value="2014">2014-2015 Regular Season</option>
	<option value="2014p">2014-2015 Playoffs</option>
	<option value="2015">2015-2016 Regular Season</option>
	<option value="2015p">2015-2016 Playoffs</option>
	<option value="2016">2016-2017 Regular Season</option>
	<option value="2016p">2016-2017 Playoffs</option>
	<option value="2017">2017-2018 Regular Season</option>
	<option value="career">Career Regular Season</option>
	<option value="careerp">Career Playoffs</option>
	<option value="week">This Week (live)</option>
</select>
</form>
<script type="text/javascript">
	function setDropdown($year) {
		$("option").each(function() {
			if($(this).attr("value") == $year) $(this).parent().attr("selectedIndex", $(this).index());
		});
	}
</script>
<?php
	if(isset($_POST['year'])) {
		printLeaders($_POST['year']);
		echo "<script type='text/javascript'>setDropdown('" . $_POST['year']. "');</script>";
	}
	else {
		printLeaders("week");
		echo "<script type='text/javascript'>setDropdown('week');</script>";
	}
?>
</div>

<? mysqli_close(); ?>

</center></body>
</html>

