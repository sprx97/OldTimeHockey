import React from 'react';

// Returns the appropriate trophy image file for a given tier and year
export function GetTrophy(tier, year) {
  var str = "images/trophies/D" + tier;

  if (year == 2019) str += "Covid";
  else str += "Champion";

  str += ".png";

  return str;
}

// function to generate trophie images from the integer returned
export function generateTrophies(trophies) {
  var primes = {19: "D1Covid", 17: "D2Covid", 13: "D3Covid", 11: "D4Covid", 7: "D1Champion", 5: "D2Champion", 3: "D3Champion", 2: "D4Champion"};
  var output = [];
  Object.keys(primes).forEach(key => {
    while (trophies % key === 0) {
      var value = primes[key];
      output.unshift(<img src={`/images/trophies/${value}.png`} align="center" title={`${value}`} alt={`${value} winner`} width="12px" height="24px" />);
      trophies /= key;
    }
  });
  return <span className="trophies">{output}</span>;
}

// Map of division name to tiers, used for classname logic
export const divisionMapping = {
  "Gretzky":"D1",
  "Eastern":"D2",
  "Western":"D2",
  "Roy":"D2",
  "Hasek":"D2",
  "Brodeur":"D2",
  "Price-Murray":"D2",
  "Jones-Allen":"D2",
  "Freddie-Hutton":"D2",
  "Howe":"D3",
  "Lemieux":"D3",
  "Dionne":"D3",
  "Francis":"D3",
  "Yzerman":"D3",
  "Jagr":"D3",
  "Messier":"D3",
  "Sakic":"D3",
  "Esposito":"D4",
  "Recchi":"D4",
  "Coffey":"D4",
  "Bourque":"D4",
  "Pronger":"D4",
  "Lidstrom":"D4",
  "Chelios":"D4",
  "Orr":"D4",
  "Leetch":"D4",
  "Niedermayer":"D4",
};

// function for highlighting all rows of the same league on hover
export function highlightLeague(e) {
  var league = "NONE";
  var tr = e.target.closest("tr");

  for (var div in divisionMapping) {
    if (tr.classList.contains(div)) {
      league = div;
      break;
    }
  }

  for (let row of tr.parentElement.getElementsByClassName(league)) {
    if (!row.className.includes("highlight"))
      row.className += " highlight";
  }
}

// function for unhighlighting all rows of the same league on unhover
export function unhighlightLeague(e) {
  var league = "NONE";
  var tr = e.target.closest("tr");

  for (var div in divisionMapping) {
    if (tr.classList.contains(div)) {
      league = div;
      break;
    }
  }

  for (let row of tr.parentElement.getElementsByClassName(league)) {
    row.className = row.className.replace(/\b highlight\b/, "");
  }
}
