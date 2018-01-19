<!--
        trophies.php
        Jeremy "sprx97" Vercillo
        10/13/15

        OTH Trophy Room. Currently updated manually
-->

<html>
<title>Trophy Room</title>

<?php include("header.html");?>
<script type="text/javascript" src="tools/jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript">
        document.getElementById("trophies").className += "selected";

        $(document).ready(function() {
/*              $(document).scroll(function() {
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
<link href="hof.css" rel="stylesheet"/>

<h5><i>*Last Updated 10/10/16</i></h5>

<body><center>
<div class="header">Division 1 Champions</div>
<div>
	<img src="images/banners/2014D1.png" alt="2014 D1 Champion: Concini" />
	<img src="images/banners/2015D1.png" alt="2015 D1 Champion: Teratic" />
	<img src="images/banners/2016D1.png" alt="2016 D1 Champion: Woppa1" />
</div>

<div class="header">Points For Champions</div>
<div>
	<img src="images/banners/2013PF.png" alt="2013 PF Champion: Woppa1" />
	<img src="images/banners/2014PF.png" alt="2014 PF Champion: Teratic" />
	<img src="images/banners/2015PF.png" alt="2015 PF Champion: InvisibleTaco" />
	<img src="images/banners/2016PF.png" alt="2016 PF Champion: Woppa1" />
</div>

<div class="header">Woppa Cup Champions</div>
<div>
	<img src="images/banners/2013WC.png" alt="2013 Woppa Cup Champion: Cannon49" />
	<img src="images/banners/2014WC.png" alt="2014 Woppa Cup Champion: FCBcn19" />
	<img src="images/banners/2015WC.png" alt="2015 Woppa Cup Champion: Hkyplyr" />
	<img src="images/banners/2016WC.png" alt="2016 Woppa Cup Champion: SleepTalkerz" />
</div>

<h5><i>*Last Updated 10/10/16</i></h5>

</center></body>
