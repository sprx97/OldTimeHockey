import React from 'react';

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

// function to generate trophie images from the integer returned
export function generateTrophies(trophies) {
  var primes = {7: "D1", 5: "D2", 3: "D3", 2: "D4"};
  var output = [];
  Object.keys(primes).forEach(key => {
    while (trophies % key === 0) {
      var value = primes[key];
      output.unshift(<img src={`/images/trophies/${value}Champion.png`} align="center" title={`${value}`} alt={`${value} winner`} width="12px" height="24px" />);
      trophies /= key;
    }
  });
  return <span className="trophies">{output}</span>;
}

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
  
//  alert(tr.parentElement.getElementsByClassName(league).length);
  
// for (var row in tr.parentElement.childNodes) {
//   if (row.classList.contains(league)) {
//     row.classList.add("highlight");
//   }
// }
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

// for (var row in tr.parentElement.childNodes) {
//   if (row.classList.contains(league)) {
//     row.classList.remove("highlight");
//   }
// }
}
