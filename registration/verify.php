<?php
	$user = isset($_GET["user"]) ? $_GET["user"] : "";
	$site = isset($_GET["site"]) ? $_GET["site"] : "";

	// attempt to access reddit user page
	if($site == "reddit") {
		$url = "https://www.reddit.com/user/" . $user;
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_NOBODY, true);
		$result = curl_exec($curl);
		$status_code = ($result == false) ? "null" : curl_getinfo($curl, CURLINFO_HTTP_CODE);
		if($status_code == 200) {
			echo "true";
			return;
		}
		else {
			echo "Reddit account not found: " . $status_code . ".";
			return;
		}
	}

	// attempt to access fleaflicker user page
	else if($site == "fleaflicker") {
		// ID should already be verified as a number client-side
		$url = "http://www.fleaflicker.com/users/" . $user;
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_NOBODY, true);
		$result = curl_exec($curl);
		$status_code = ($result == false) ? "null" : curl_getinfo($curl, CURLINFO_HTTP_CODE);
		if($status_code == 200) {
			echo "true";
			return;
		}
		else {
			echo "Fleaflicker account not found: " . $status_code . ".";
			return;
		}
	}

	// invalid site
	else {
		echo "Invalid Site Error.";
	}
?>
