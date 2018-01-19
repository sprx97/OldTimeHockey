<!--
	index.php
	Jeremy "sprx97" Vercillo
	8/22/14

	This should just be the main welcome page, with links
	to other areas of the site. We can decide later what
	should go here and what links we need.
-->

<html>
<title>Old Time Hockey!</title>

<?php include("header.html");?>
<link href="tools/jquery/bracket/dist/jquery.bracket.min.css" rel="stylesheet">
<script type="text/javascript" src="tools/jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript">
	document.getElementById("woppa").className += "selected";
</script>
<script type="text/javascript" src="jquery/bracket/dist/jquery.bracket.min.js"></script>

<body>

<div style="margin:10px">
<h6 style="margin:10px">Logo by <a href="www.reddit.com/u/tweedledunn">/u/tweedledun</a></h6>
<center>

<div style="margin:10px">
<form method="POST">
<select name="year" onchange="this.form.submit()">
        <option value="2012">2012-2013</option>
        <option value="2013">2013-2014</option>
        <option value="2014">2014-2015</option>
        <option value="2015">2015-2016</option>
        <option value="2016">2016-2017</option>
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
                echo "<script type='text/javascript'>setDropdown(" . $_POST['year'] . ");</script>";
		echo "<iframe src='http://www.challonge.com/woppacup" . ($_POST['year'] + 1) . "' width='100%' height='100%'/>";
        }
        else {
                echo "<script type='text/javascript'>setDropdown(" . $curryear . ");</script>";
		echo "<iframe src='http://www.challonge.com/woppacup" . ($curryear + 1) . "' width='100%' height='100%'/>";
        }
?>

</div>

<!--
<form method="post">
<select name="whichBracket" onchange="this.form.submit()">
	<option value="w">Winner's Bracket</option>
	<option value="l">Loser's Bracket</option>
	<option value="f">Full Bracket</option>
</select>
</form>
</h4>Seeds are tentative. Tournament starts November 11th.</h4>
</center>
</div>
<div style="position:fixed;width:100%;height:100%;background:url('images/WoppaCupLogo.png')no-repeat;background-size:60%;background-position:center;opacity:0.2;"></div>
<div class="my_bracket" align="center" style="margin:10px"></div>

<script type="text/javascript">
	function setDropdown($opt) {
		$("option").each(function() {
                        if($(this).attr("value") == $opt) $(this).parent().attr("selectedIndex", $(this).index());
                });
		$whichBr = $opt;
        }

	function toggleBrackets($b) {
		if($b == "w") {
			$(".loserBracket").addClass("hidden_br");
			$(".bracket").removeClass("hidden_br");
			$winLeft = -$(".bracket").position().left;
			$(".jQBracket").width($(".jQBracket").width()+$winLeft);
		}
		else if($b == "l") {
			$(".bracket").addClass("hidden_br");
			$(".finals").addClass("hidden_br");
			$(".loserBracket").removeClass("hidden_br");
		}
		else {
			$(".loserBracket").removeClass("hidden_br");
			$(".bracket").removeClass("hidden_br");
			$(".finals").removeClass("hidden_br");
		}
	}

	function seeding(numPlayers) {
		var rounds = Math.log(numPlayers)/Math.log(2)-1;
		var pls = [1,2];
		for(n = 0; n < rounds; n++) {
			pls = nextLayer(pls);
		}
		return pls;

		function nextLayer(pls) {
			var out = [];
			var length = pls.length*2+1;
			pls.forEach(function(d) {
				out.push(d);
				out.push(length-d);
			});
			return out;
		}
	}

	function setSeeds($teams) {
		var PFranks = new Array();
		$teams = $teams.split("|||"); // I hope no one uses | in their name
		PFranks = $teams;
		while(PFranks.length < 256) PFranks.push("BYE");

		var seeds = seeding(256);
		var matchups = new Array();
		for(n = 0; n < seeds.length; n += 2) {
			var high = seeds[n];
			var low = seeds[n+1];
			var match = [PFranks[high-1].split("||")[0], PFranks[low-1].split("||")[0]];
			matchups.push(match);
		}

		var round1 = [];
		for(n = 0; n < matchups.length; n++) {
			// check for scores here
			if(matchups[n][0] == "BYE") {
				round1.push(["BYE", 0]);
			}
			else if(matchups[n][1] == "BYE") {
				round1.push([0, "BYE"]);
			}
			else round1.push([]);
		} // first round results

		var tourney = {
			"teams": matchups,
			"results":[
				  [round1], // Winner's Bracket
				  [], // Loser's Bracket
				  [] // Final Bracket
			],
			"round_labels":[
				["Week 6", "Week 7", "Week 9", "Week 11", "Week 13", "Week 15", "Week 17", "Week 19"],
				["Week 8", "Week 9", "Week 10", "Week 11", "Week 12", "Week 13", "Week 14", "Week 15", "Week 16", "Week 17", "Week 18", "Week 19", "Week 20", "Week 21"],
				["Week 22", "Week 23"]]
		}

		$(function() {
			$(".my_bracket").bracket({
				init:tourney,
				// onMatchClick and onMatchHover
			});
			toggleBrackets($whichBr);
		});
	}
</script>

<?php
        if(isset($_POST['whichBracket'])) {
                echo "<script type='text/javascript'>setDropdown('" . $_POST['whichBracket'] . "');</script>";
        }
        else {
                echo "<script type='text/javascript'>setDropdown('f');</script>";
        }

	$seeds = str_replace("\n", "|||", file_get_contents("scripts/seeds.txt"));
	$seeds = str_replace("\t", "||", $seeds);
	$seeds = addslashes($seeds);
	echo "<script type='text/javascript'>setSeeds('" . $seeds . "');</script>";
?>
-->
</body>

</html>

