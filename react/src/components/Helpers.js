import React from 'react';

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
