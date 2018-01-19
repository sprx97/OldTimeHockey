<!--
	hof.php
	Jeremy "sprx97" Vercillo
	9/14/14

	OTH Record book. Currently updated manually
-->

<html>
<title>Hall of Fame</title>

<?php include("header.html");?>
<script type="text/javascript" src="jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript">
	document.getElementById("hof").className += "selected";

	$(document).ready(function() {
/*		$(document).scroll(function() {
			$(".header").each(function(index) {
				if($(this).offset().top - $(window).scrollTop() <= $("nav").height() && $(this).not(".anchored")) {
					$(this).addClass("anchored");
				}
				else if($(this).hasClass("anchored")) {
					$(this).removeClass("anchored");
				}
			});
		});
*/
	});
</script>
<link href="css/hof.css" rel="stylesheet"/>

<body>
<div class="header">Career Regular Season Records</div>
<div class="career">
<h2><u>Wins</u></h2>
<?php
        $con = mysqli_connect("localhost", "othuser", "othpassword", "OldTimeHockey");
        if(mysqli_connect_errno()) echo "Failed to connect to MySQL: " . mysqli_connect_errno();

	$leaders = mysqli_query($con, "SELECT FFname, SUM(wins) as w from Teams INNER JOIN Users on FFid=ownerID where replacement != 1 GROUP BY ownerID ORDER BY w DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[1] . " - " . $next[0] . "</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
<br>
<h2><u>Winning Percentage</u></h2>
<h6>Minimum 40 GP (2 seasons)</h6>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, ROUND(wpct, 4), total, w, l from (SELECT FFname, w/(w+l) as wpct, (w+l) as total, w, l from (SELECT FFname, sum(wins) as w, sum(losses) as l from (Users INNER JOIN Teams on FFid=ownerID) where replacement != 1 group by ownerID) as T1) as T2 where total > 40 ORDER BY wpct desc");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[1] . " - " . $next[0] . " (" . $next[3] . "-" . $next[4] . ")</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
<br>
<h2><u>Points For</u></h2>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, ROUND(SUM(pointsFor), 2) as PF from Teams INNER JOIN Users on FFid=ownerID where replacement != 1 GROUP BY ownerID ORDER BY PF DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[1] . " - " . $next[0] . "</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
<br>

<h2><u>Average Points For</u></h2>
<h6>Minimum 40 GP (2 seasons)</h6>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, ROUND(PF/total, 2) as avg, total from (SELECT FFname, SUM(pointsFor) as PF, (SUM(wins)+SUM(losses)) as total from Users INNER JOIN Teams on FFid=ownerID where replacement != 1 GROUP BY ownerID) as T1 where total > 40 order by avg DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[1] . " - " . $next[0] . " (" . $next[2] . " GP)</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
</div>
<br>

<h2>Coach Rating</h2>
<h6> Minimum 40 GP (2 seasons)</h6>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, careerCR, total from (SELECT FFname, ROUND(100*sum(pointsFor)/SUM(100.0*pointsFor/coachRating), 2) as careerCR, (SUM(wins)+SUM(losses)) as total from Users INNER JOIN Teams on FFid=ownerID where replacement != 1 and pointsFor > 0 group by ownerID) as T1 where total > 40 order by careerCR DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[1] . "% - " . $next[0] . " (" . $next[2] . " GP)</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>

<div class="header">Single Season Records</div>
<div class="season">
<h2>Best Record (pct)</h2>
<?php
        $weekVars = fopen("/var/www/roldtimehockey/scripts/WeekVars.txt", "r");
        $curryear = trim(fgets($weekVars));
        fclose($weekVars);

	$leaders = mysqli_query($con, "SELECT FFname, round(wins/(wins+losses), 3) as wpct, wins, losses, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID where replacement != 1 and wins > 0 and year != 2012 and year != " . $curryear . " order by wpct DESC, wins DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[2] . "-" . $next[3] . " (" . $next[1] . ") - " . $next[0] . " (" . $next[5] . "-" . ($next[5] + 1) . " " . $next[4] . ")</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
<br>

<h2>Best Record (wins)</h2>
<h6><i>currently active</i></h6>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, wins, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID where replacement != 1 order by wins DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>";
		if($next[3] == $curryear) echo "<i>";
		echo $next[1] . " - " . $next[0] . " (" . $next[3] . "-" . ($next[3] + 1) . " " . $next[2] . ")";
		if($next[3] == $curryear) echo "</i>";
		echo "</li>";

		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
<br>

<h2>Most Points For</h2>
<h6><i>currently active</i></h6>
<h6>* = 12-team league</h6>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, pointsFor, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID where replacement != 1 order by pointsFor DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>";
		if($next[3] < 2014 && $next[2] != "Gretzky") echo "*"; // Non-Gretzky leagues were 12-teams before 2014
		echo $next[1] . " - " . $next[0] . " (" . $next[3] . "-" . ($next[3] + 1) . " " . $next[2] . ")";
		echo "</li>";

		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
<br>

<h2>Highest Coaching Rating</h2>
<?php
	$leaders = mysqli_query($con, "SELECT FFname, coachRating, Leagues.name, year from Users INNER JOIN Teams on FFid=ownerID INNER JOIN Leagues on id=LeagueID where replacement != 1 and pointsFor > 0 and year != " . $curryear . " order by coachRating DESC");

	echo "<ul>";

	$count = 0;
	$lastVal = 0;
	$fontSize = 28;
	while(1) {
		$next = mysqli_fetch_array($leaders);
		if($count >= 5 && $lastVal != $next[1])
			break;
		// break after 5 entries, or more if there's a tie

		if($count != 0 && $lastVal != $next[1])
			$fontSize -= 4;

		echo "<li style='font-size:" . $fontSize . "px'>" . $next[1] .  " - " . $next[0] . " (" . $next[3] . "-" . ($next[3] + 1) . " " . $next[2] . ")</li>";
		$lastVal = $next[1];
		$count++;
	}

	echo "</ul>";
?>
</div>

<div class="header">Daily/Weekly Records</div>
<div class="daily">
	<h1 style="color:red">WARNING! Under renovation beyond here!</h1>
<h5><i>*Last Updated 10/10/2016</i></h5>
<h2>Best Night</h2>
<ul><li>SPEMason - 111.4 (11/8/2014)</li></ul>
<ul><li>InvisibleTaco - 109.95 (10/11/2014)</li></ul>
<ul><li>iamslm22 - 104.25 (1/19/2013)</li></ul>
<br>
<h2>Best Week</h2>
<ul><li>KilroyLeges - 362.5 (4/1/13 - 4/7/13, Week 11)</li></ul>
</div>

<div class="header">Streaks</div>
<div class="streaks">
<h2>Longest Win Streak</h2>
<h6><i>currently active</i></h6>
<ul>
	<li><i>tweedledunn - 26 (2013-14 Wk 21 - PRESENT)</i></li>
	<li>Teratic - 24 (2013-14 Wk1 - 2014-15 Wk2)</li>
	<li>Woppa - 23 (2013-14 Wk6 - 2014-15 Wk6)</li>
	<li>dimwell - 19 (2014-15 Wk5 - 2014-15 Wk23)</li>
</ul>
</div>
<br>
<br>
<br>
<h5><i>*Last Updated 10/10/2016</i></h5>

</body>
</html>

