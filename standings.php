<!--
	standings.php
	Jeremy "sprx97" Vercillo
	8/26/14

	Standings for all leagues in one place.
-->

<html>
<title>League Standings</title>

<?php include("header.html");?>
<script type="text/javascript" src="tools/jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript">
	document.getElementById("standings").className += "selected";
</script>
<link href="css/divisions.css" rel="stylesheet"/>
<link href="css/standings.css" rel="stylesheet"/>

<?php
	$con = mysqli_connect("104.236.183.115", "othuser", "othpassword", "OldTimeHockey");
	if(mysqli_connect_errno()) echo "Failed to connect to MySQL: " . mysqli_connect_errno();

	function printStandings($YEAR) {
		global $con;

		echo "<div class='column'>";
		echo "<h1><u>Division Ranks</u></h1>";

		$ranks = mysqli_query($con, "SELECT * from (SELECT Leagues.name, round(sum(pointsFor), 2) as PF, round(sum(pointsFor)/(count(*)), 2) from Leagues inner join Teams on id=leagueID where year=" . $YEAR . " group by Leagues.name) as t order by PF desc");

		echo "<table class='rankings'>";

		echo "<colgroup>";
		echo "<col width='5%'>";
		echo "<col width='55%'>";
		echo "<col width='20%'>";
		echo "<col width='20%'>";
		echo "</colgroup>";

		echo "<tr>";
		echo "<th></th>";
		echo "<th>League</th>";
		echo "<th>Total PF</th>";
		echo "<th>Avg PF</th>";

		$n = 1;
		while($league = mysqli_fetch_array($ranks)) {
			echo "<tr class='" . $league[0] . "'>";
			echo "<td>" . $n++ . "</td>";
			echo "<td>" . $league[0] . "</td>";
			echo "<td>" . $league[1] . "</td>";
			echo "<td>" . $league[2] . "</td>";
			echo "</tr>";
		}

		echo "</table><br>";
		echo "</div>";

		for($n = 1; $n <= 4; $n++) {
			$tier = mysqli_query($con, "SELECT * from Leagues where year=" . $YEAR . " AND tier=" . $n);

			echo "<div class='tier division" . $n . "'>";
			echo "<h1><u>Division " . $n . "<br></u></h1>";

			while($league = mysqli_fetch_array($tier)) {
				echo "<div class=\"column\">";
				echo "<h3>" . $league['name'] . "<img src='images/jerseys/" . $league['name'] . ".png' width=50px></h3>";
				echo "<table class='" . $league['name'] . "'>";

				echo "<tr>";
				echo "<th></th>";
				echo "<th>Team</th>";
				echo "<th>Owner</th>";
				echo "<th>W</th>";
				echo "<th>L</th>";
				echo "</tr>";

				echo "<colgroup>";
				echo "<col width=\"6%\">";
				echo "<col width=\"50%\">";
				echo "<col width=\"30%\">";
				echo "<col width=\"7%\">";
				echo "<col width=\"7%\">";
				echo "</colgroup>";

				$teams = mysqli_query($con, "SELECT * from (Teams INNER JOIN Users on ownerID=FFid) where leagueID=" . $league['id'] . " ORDER BY gamesBack ASC, pointsFor DESC");
				$count = 1;
				while($team = mysqli_fetch_array($teams)) {
					echo "<tr class='team'>";
					echo "<td>" . $count++ . "</td>";
					echo "<td>" . $team['name'] . "</td>";
					echo "<td>" . $team['FFname'] . "</td>";
					echo "<td>" . $team['wins'] . "</td>";
					echo "<td>" . $team['losses'] . "</td>";
					echo "</tr>";
				}
				echo "</table>";

				echo "</div>";
			}
			echo "</div>";
		}
	}
?>

<body>
<center>

<div style="margin:10px">
<form method="POST">
<select name="year" onchange="this.form.submit()">
	<option value="2012">2012-2013</option>
	<option value="2013">2013-2014</option>
	<option value="2014">2014-2015</option>
	<option value="2015">2015-2016</option>
	<option value="2016">2016-2017</option>
	<option value="2017">2017-2018</option>
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
	$weekVars = fopen("/var/www/roldtimehockey/scripts/WeekVars.txt", "r");
	$curryear = trim(fgets($weekVars));
	fclose($weekVars);

	if(isset($_POST['year'])) {
		printStandings($_POST['year']);
		echo "<script type='text/javascript'>setDropdown(" . $_POST['year'] . ");</script>";
	}
	else {
		printStandings($curryear);
		echo "<script type='text/javascript'>setDropdown(" . $curryear . ");</script>";
	}
?>

</div>

<?php mysqli_close(); ?>

</center>
</body>
</html>

