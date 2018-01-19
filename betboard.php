<!--
        standings.php
        Jeremy "sprx97" Vercillo
        12/7/16

	Bet board for stupid shit we say!
-->

<html>
<title>Put it on the board!</title>

<?php include("header.html");?>
<script type="text/javascript" src="tools/jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript">
        document.getElementById("betboard").className += "selected";
</script>
<link href="css/betboard.css" rel="stylesheet"/>

<center><h2><u>Current bets</u></h2></center>
<table width="90%">
        <thead><b>
                <th>Date</th>
                <th>Bettor #1</th>
                <th>Says..</th>
                <th>Bettor #2</th>
                <th>Says...</th>
                <th>Condition(s)</th>
                <th>On the line</th>
        </b></thead>
        <tbody>
		<tr>
			<td>10/3/2017</td>
			<td>TwoPlanks</td>
			<td>Regular Season PF bet</td>
			<td>Windjackass</td>
			<td>Regular Season PF bet</td>
			<td>None</td>
			<td>Charity donation + flair</td>
		</tr>
		<tr>
			<td>10/4/2017</td>
			<td>Minnesnota</td>
			<td>Scott Darling wins 32+ games</td>
			<td>SPEMason</td>
			<td>Scott Darling wins <32 games</td>
			<td>None</td>
			<td>Flair</td>
		</tr>
	</tbody>
</table>

<center><h2><u>Previous bets</u></h2></center>
<table width="90%">
	<thead><b>
		<th>Date</th>
		<th>Bettor #1</th>
		<th>Says..</th>
		<th>Bettor #2</th>
		<th>Says...</th>
		<th>Condition(s)</th>
		<th>On the line</th>
	</b></thead>
	<tbody>
		<tr>
			<td>12/7/2016</td>
			<td>TwoPlanks</td>
			<td>Cam Talbot will finish as a top-5 goalie in OTH</td>
			<td>SPRX</td>
			<td>Cam Talbot will not finish as a top-5 goalie in OTH</td>
			<td>Talbot must play > 50 games</td>
			<td>"I suck at fantasy hockey" flair and a small charity donation</td>
		</tr>
		<tr>
			<td>12/19/2016</td>
			<td>BigRed</td>
			<td>GWG Picks: <a href="bigredpicks.html">1/19</a></td>
			<td>Coyle1096</td>
			<td>GWG Picks: <a href="coylepicks.html">0/19</a></td>
			<td><b>TwoPlanks' picks: </b><a href="twoplankspicks.html">0/19</a></td>
			<td>A jersey</td>
		</tr>
	</tbody>
</table>
