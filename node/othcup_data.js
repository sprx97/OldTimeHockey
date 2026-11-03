function pairKey(first, second) {
  return [Number(first), Number(second)].sort((a, b) => a - b).join(":");
}

function toGroupLabel(number) {
  let label = "";
  let value = Number(number);
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

function roundPoints(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function buildSeedOrder(size) {
  if (!Number.isInteger(size) || size < 2 || (size & (size - 1)) !== 0) {
    return [];
  }

  let order = [1, 2];
  while (order.length < size) {
    const nextSize = order.length * 2;
    order = order.flatMap(seed => [seed, nextSize + 1 - seed]);
  }
  return order;
}

function buildDoubleEliminationLayout(bracketStages, teams, tournamentSize) {
  const largestSeed = teams.reduce((maximum, team) => Math.max(maximum, Number(team.knockout_seed) || 0), 0);
  let bracketSize = 1;
  while (bracketSize < Math.max(2, largestSeed, Number(tournamentSize) || 0)) bracketSize *= 2;
  const seedPositions = new Map(buildSeedOrder(bracketSize).map((seed, index) => [seed, index]));
  const teamHistories = new Map();
  const stageOrder = new Map([["knockout", 0], ["second-chance", 1]]);
  const chronologicalRounds = bracketStages.flatMap(stage => stage.rounds.map(round => ({ stage: stage.stage, round }))).sort((first, second) =>
    Number(first.round.first_week || 0) - Number(second.round.first_week || 0) ||
    (stageOrder.get(first.stage) ?? 2) - (stageOrder.get(second.stage) ?? 2) ||
    Number(first.round.round_number) - Number(second.round.round_number)
  );

  for (const { stage, round } of chronologicalRounds) {
    for (const match of round.matches) {
      const generatedSources = [];
      for (const [side, teamId] of [["one", match.team_one_id], ["two", match.team_two_id]]) {
        if (teamId === null || teamId === undefined) continue;
        const history = teamHistories.get(Number(teamId)) || [];
        const previousMatch = history[history.length - 1];
        if (previousMatch) {
          const previousWinner = previousMatch.winner_team_id === null || previousMatch.winner_team_id === undefined
            ? null
            : Number(previousMatch.winner_team_id);
          const result = previousWinner === null
            ? (stage === "second-chance" && previousMatch.stage === "knockout" ? "loser" : "winner")
            : (previousWinner === Number(teamId) ? "winner" : "loser");
          generatedSources.push({ match_id: Number(previousMatch.match_id), source_stage: previousMatch.stage, result, side });
        }
      }
      match.generated_sources = generatedSources;
    }

    for (const match of round.matches) {
      for (const teamId of [match.team_one_id, match.team_two_id]) {
        if (teamId === null || teamId === undefined) continue;
        const history = teamHistories.get(Number(teamId)) || [];
        history.push(match);
        teamHistories.set(Number(teamId), history);
      }
    }
  }

  const upperRounds = bracketStages.find(stage => stage.stage === "knockout")?.rounds || [];
  const lowerStage = bracketStages.find(stage => stage.stage === "second-chance");
  const lowerRounds = lowerStage?.rounds || [];
  const lowerSpan = upperRounds[1]?.matches.length || Math.max(1, Math.floor((upperRounds[0]?.matches.length || 1) / 2));
  const upperMatchById = new Map(upperRounds.flatMap(round => round.matches).map(match => [Number(match.match_id), match]));

  for (const round of upperRounds) {
    const placements = round.matches.map((match, index) => {
      const sourceMatches = (match.generated_sources || [])
        .map(source => upperMatchById.get(source.match_id))
        .filter(Boolean);
      const sourceCenters = sourceMatches
        .filter(source => Number.isFinite(Number(source.generated_bracket_row)))
        .map(source => Number(source.generated_bracket_row));
      const seedCenters = [];
      if (!sourceCenters.length) {
        for (const [teamId, seed] of [[match.team_one_id, match.team_one_knockout_seed], [match.team_two_id, match.team_two_knockout_seed]]) {
          if (teamId === null || teamId === undefined) continue;
          const seedPosition = seedPositions.get(Number(seed));
          if (seedPosition !== undefined) seedCenters.push(Math.floor(seedPosition / 2) + 0.5);
        }
      }
      const centers = sourceCenters.length ? sourceCenters : [...new Set(seedCenters)];
      return {
        match,
        center: centers.length ? centers.reduce((total, center) => total + center, 0) / centers.length : index + 0.5
      };
    });
    placements.sort((first, second) => first.center - second.center || Number(first.match.match_number) - Number(second.match.match_number));
    placements.forEach((placement, index) => { placement.match.generated_bracket_row = placement.center; });
  }

  if (lowerRounds.length) {
    for (const round of lowerRounds.slice(1)) {
      const matchCount = round.matches.length;
      round.matches.forEach(match => {
        match.generated_bracket_row = (Number(match.match_number) - 0.5) * lowerSpan / matchCount + 0.5;
      });
    }

    const firstLowerRound = lowerRounds[0];
    const nextLowerRound = lowerRounds[1];
    const nextRoundGap = nextLowerRound?.matches.length ? lowerSpan / nextLowerRound.matches.length : 1;
    firstLowerRound.matches.forEach((match, index) => {
      const child = nextLowerRound?.matches.find(candidate =>
        (candidate.generated_sources || []).some(source => source.match_id === Number(match.match_id))
      );
      match.generated_bracket_row = child
        ? Number(child.generated_bracket_row) + nextRoundGap / 2
        : (Number(match.match_number) - 0.5) * lowerSpan / firstLowerRound.matches.length + 0.5;
      if (!Number.isFinite(match.generated_bracket_row)) match.generated_bracket_row = index + 0.5;
    });
  }

  for (const stage of bracketStages) {
    const matchById = new Map(stage.rounds.flatMap(round => round.matches).map(match => [Number(match.match_id), match]));
    stage.feeders = stage.rounds.flatMap(round => round.matches.flatMap(match =>
      (match.generated_sources || [])
        .filter(source => matchById.has(source.match_id))
        .map(source => ({ source_match_id: source.match_id, target_match_id: Number(match.match_id), result: source.result }))
    ));

    for (const round of stage.rounds) {
      round.matches.sort((first, second) =>
        Number(first.generated_bracket_row ?? Infinity) - Number(second.generated_bracket_row ?? Infinity) ||
        Number(first.match_number) - Number(second.match_number)
      );
    }
  }
}

function compareByCriteria(first, second, criteria) {
  for (const criterion of criteria) {
    let firstValue;
    let secondValue;
    if (criterion.tiebreak_type === "wins vs tied teams") {
      firstValue = first.wins_vs_tied_teams;
      secondValue = second.wins_vs_tied_teams;
    } else if (criterion.tiebreak_type === "points for") {
      firstValue = first.points_for;
      secondValue = second.points_for;
    } else {
      continue;
    }

    if (firstValue !== secondValue) {
      return secondValue - firstValue;
    }
  }
  return 0;
}

function sameStandingsResult(first, second, criteria) {
  return first.wins === second.wins && compareByCriteria(first, second, criteria) === 0;
}

function scoreForTeam(teamId, weeks, scoreMap) {
  if (!weeks.length || weeks.some(week => !scoreMap.has(`${teamId}:${week}`))) {
    return null;
  }

  return roundPoints(weeks.reduce((total, week) => total + scoreMap.get(`${teamId}:${week}`), 0));
}

function decorateMatch(match, scoreMap) {
  const weeks = [match.first_week, match.second_week].filter(week => week !== null && week !== undefined);
  const scoreOne = match.match_type === "bye" || match.team_one_id === null ? null : match.team_one_score_override == null
    ? scoreForTeam(match.team_one_id, weeks, scoreMap)
    : roundPoints(match.team_one_score_override);
  const scoreTwo = match.match_type === "bye" || match.team_two_id === null ? null : match.team_two_score_override == null
    ? scoreForTeam(match.team_two_id, weeks, scoreMap)
    : roundPoints(match.team_two_score_override);
  const tied = scoreOne !== null && scoreTwo !== null && scoreOne === scoreTwo;
  const winnerId = match.match_type === "bye"
    ? Number(match.team_one_id ?? match.team_two_id)
    : scoreOne === null || scoreTwo === null || tied
      ? null
      : (scoreOne > scoreTwo ? Number(match.team_one_id) : Number(match.team_two_id));
  const displayedWinnerId = match.override_winning_team_id === null || match.override_winning_team_id === undefined
    ? winnerId
    : Number(match.override_winning_team_id);

  return {
    ...match,
    score_one: scoreOne,
    score_two: scoreTwo,
    score_weeks: weeks,
    winner_team_id: displayedWinnerId,
    winner_name: displayedWinnerId === Number(match.team_one_id) ? match.team_one_name : (displayedWinnerId === Number(match.team_two_id) ? match.team_two_name : null),
    winner_manager: displayedWinnerId === Number(match.team_one_id) ? match.team_one_manager : (displayedWinnerId === Number(match.team_two_id) ? match.team_two_manager : null),
    is_tie: tied,
    score_available: match.match_type !== "bye" && scoreOne !== null && scoreTwo !== null
  };
}

function buildStandings(groups, groupMatches, groupTiebreakers, advanceCount) {
  const teamsById = new Map();
  for (const group of groups) {
    for (const team of group.teams) {
      team.wins = 0;
      team.losses = 0;
      team.ties = 0;
      team.games_played = 0;
      team.points_for = 0;
      team.wins_vs_tied_teams = 0;
      teamsById.set(team.team_id, team);
    }
  }

  for (const match of groupMatches) {
    if (!match.score_available) continue;
    const first = teamsById.get(match.team_one_id);
    const second = teamsById.get(match.team_two_id);
    if (!first || !second) continue;

    first.games_played += 1;
    second.games_played += 1;
    first.points_for = roundPoints(first.points_for + match.score_one);
    second.points_for = roundPoints(second.points_for + match.score_two);
    if (match.override_winning_team_id === first.team_id || (match.override_winning_team_id == null && match.score_one > match.score_two)) {
      first.wins += 1;
      second.losses += 1;
    } else if (match.override_winning_team_id === second.team_id || (match.override_winning_team_id == null && match.score_two > match.score_one)) {
      second.wins += 1;
      first.losses += 1;
    } else {
      first.ties += 1;
      second.ties += 1;
    }
  }

  const tiedWinGroups = new Map();
  for (const group of groups) {
    const byWins = new Map();
    for (const team of group.teams) {
      if (!byWins.has(team.wins)) byWins.set(team.wins, new Set());
      byWins.get(team.wins).add(team.team_id);
    }
    tiedWinGroups.set(group.group_number, byWins);
  }

  for (const match of groupMatches) {
    if (!match.score_available) continue;
    const groupTiers = tiedWinGroups.get(match.group_number);
    const first = teamsById.get(match.team_one_id);
    const second = teamsById.get(match.team_two_id);
    if (!groupTiers || !first || !second || first.wins !== second.wins) continue;
    const tiedTeams = groupTiers.get(first.wins);
    if (!tiedTeams || !tiedTeams.has(first.team_id) || !tiedTeams.has(second.team_id)) continue;

    if (match.override_winning_team_id === first.team_id || (match.override_winning_team_id == null && match.score_one > match.score_two)) first.wins_vs_tied_teams += 1;
    else if (match.override_winning_team_id === second.team_id || (match.override_winning_team_id == null && match.score_two > match.score_one)) second.wins_vs_tied_teams += 1;
  }

  for (const group of groups) {
    group.teams.sort((first, second) => {
      if (first.wins !== second.wins) return second.wins - first.wins;
      const tiebreakResult = compareByCriteria(first, second, groupTiebreakers);
      if (tiebreakResult !== 0) return tiebreakResult;
      return first.initial_seed - second.initial_seed;
    });

    let previous = null;
    for (let index = 0; index < group.teams.length; index += 1) {
      const team = group.teams[index];
      team.place = previous && sameStandingsResult(previous, team, groupTiebreakers)
        ? group.teams[index - 1].place
        : index + 1;
      team.qualified = team.place <= advanceCount;
      team.tiebreak_unresolved = index > 0 && sameStandingsResult(group.teams[index - 1], team, groupTiebreakers);
      previous = team;
    }
  }
}

function assignBracketNumbers(knockoutMatches, teams, knockoutRounds) {
  const tournamentSize = teams.reduce((maximum, team) => Math.max(maximum, Number(team.knockout_seed) || 0), 0);
  const seedOrder = buildSeedOrder(tournamentSize);
  const positionBySeed = new Map(seedOrder.map((seed, index) => [seed, index]));
  const teamById = new Map(teams.map(team => [team.team_id, team]));
  const firstMatchByNumber = {};
  let nextMatchNumber = 1;
  for (const round of knockoutRounds) {
    firstMatchByNumber[round.round_number] = nextMatchNumber;
    nextMatchNumber += Math.max(1, tournamentSize / (2 ** round.round_number));
  }

  for (const match of knockoutMatches) {
    const firstTeam = teamById.get(match.team_one_id);
    const secondTeam = teamById.get(match.team_two_id);
    const firstPosition = firstTeam && positionBySeed.get(Number(firstTeam.knockout_seed));
    const secondPosition = secondTeam && positionBySeed.get(Number(secondTeam.knockout_seed));
    const roundNumber = Number(match.round_number);
    const bracketIndex = (firstPosition === undefined || secondPosition === undefined)
      ? null
      : Math.floor(firstPosition / (2 ** roundNumber));
    const secondBracketIndex = (firstPosition === undefined || secondPosition === undefined)
      ? null
      : Math.floor(secondPosition / (2 ** roundNumber));

    match.bracket_index = bracketIndex === secondBracketIndex ? bracketIndex : null;
    match.bracket_match_number = match.bracket_index === null
      ? null
      : firstMatchByNumber[roundNumber] + match.bracket_index;
    match.pairing_consistent = null;
  }

  const matchByNumber = new Map(knockoutMatches.filter(match => match.bracket_match_number !== null).map(match => [match.bracket_match_number, match]));
  for (const match of knockoutMatches) {
    const roundNumber = Number(match.round_number);
    const bracketNumber = match.bracket_match_number;
    if (bracketNumber === null) {
      match.pairing_consistent = false;
      continue;
    }

    const index = match.bracket_index;
    let expectedTeams;
    if (roundNumber === 1) {
      expectedTeams = [seedOrder[index * 2], seedOrder[index * 2 + 1]]
        .map(seed => teams.find(team => Number(team.knockout_seed) === seed))
        .filter(Boolean)
        .map(team => team.team_id);
    } else {
      const previousRoundFirst = firstMatchByNumber[roundNumber - 1];
      const firstFeeder = matchByNumber.get(previousRoundFirst + index * 2);
      const secondFeeder = matchByNumber.get(previousRoundFirst + index * 2 + 1);
      expectedTeams = firstFeeder && secondFeeder && firstFeeder.winner_team_id !== null && secondFeeder.winner_team_id !== null
        ? [firstFeeder.winner_team_id, secondFeeder.winner_team_id]
        : null;
    }

    match.pairing_consistent = expectedTeams === null
      ? null
      : expectedTeams.length === 2 && pairKey(expectedTeams[0], expectedTeams[1]) === pairKey(match.team_one_id, match.team_two_id);
  }

  for (const round of knockoutRounds) {
    round.matches.sort((first, second) => (first.bracket_match_number || Infinity) - (second.bracket_match_number || Infinity));
  }
}

function resolveTiedMatchesFromAdvancement(knockoutRounds) {
  const roundsByNumber = new Map(knockoutRounds.map(round => [Number(round.round_number), round]));
  for (const round of knockoutRounds) {
    const nextRound = roundsByNumber.get(Number(round.round_number) + 1);
    if (!nextRound || !nextRound.matches.length) continue;
    const advancingTeams = new Set(nextRound.matches.flatMap(match => [Number(match.team_one_id), Number(match.team_two_id)]));
    for (const match of round.matches) {
      if (!match.is_tie || !match.score_available) continue;
      const firstAdvanced = advancingTeams.has(Number(match.team_one_id));
      const secondAdvanced = advancingTeams.has(Number(match.team_two_id));
      if (firstAdvanced === secondAdvanced) continue;
      const winnerIsFirst = firstAdvanced;
      match.winner_team_id = winnerIsFirst ? Number(match.team_one_id) : Number(match.team_two_id);
      match.winner_name = winnerIsFirst ? match.team_one_name : match.team_two_name;
      match.winner_manager = winnerIsFirst ? match.team_one_manager : match.team_two_manager;
      match.is_tie = false;
      match.tiebreak_resolved_by_advancement = true;
    }
  }
}

function resolveScoringNotesFromAdvancement(knockoutRounds) {
  const roundsByNumber = new Map(knockoutRounds.map(round => [Number(round.round_number), round]));
  for (const round of knockoutRounds) {
    const nextRound = roundsByNumber.get(Number(round.round_number) + 1);
    if (!nextRound || !nextRound.matches.length) continue;
    const advancingTeams = new Set(nextRound.matches.flatMap(match => [Number(match.team_one_id), Number(match.team_two_id)]));
    for (const match of round.matches) {
      if (!match.scoring_note) continue;
      const advancingParticipants = [Number(match.team_one_id), Number(match.team_two_id)].filter(teamId => advancingTeams.has(teamId));
      if (advancingParticipants.length !== 1) continue;
      const winnerId = advancingParticipants[0];
      const winnerIsFirst = winnerId === Number(match.team_one_id);
      match.winner_team_id = winnerId;
      match.winner_name = winnerIsFirst ? match.team_one_name : match.team_two_name;
      match.winner_manager = winnerIsFirst ? match.team_one_manager : match.team_two_manager;
      match.is_tie = false;
    }
  }
}

module.exports = async function getOthCupData(pool, requestedYear) {
  if (requestedYear !== undefined && !/^\d{4}$/.test(String(requestedYear))) {
    const error = new Error("year must be a four-digit year");
    error.statusCode = 400;
    throw error;
  }

  const [availableYears] = await pool.execute(
    "SELECT year, name, status, is_double_elimination FROM OTHCupTournaments ORDER BY year DESC"
  );
  const year = requestedYear === undefined
    ? (availableYears.length ? Number(availableYears[0].year) : null)
    : Number(requestedYear);

  if (year === null) {
    return { available_years: availableYears, tournament: null, groups: [], knockout_rounds: [], bracket_stages: [] };
  }

  const [tournaments] = await pool.execute(
    "SELECT year, name, challonge_link, status, num_entries, num_groups, knockout_size, is_double_elimination, allow_group_stage_ties, knockout_reseed_type FROM OTHCupTournaments WHERE year=?",
    [year]
  );
  if (!tournaments.length) {
    const error = new Error(`No OTH Cup tournament exists for ${year}`);
    error.statusCode = 404;
    throw error;
  }

  const [teams, rounds, tiebreakers, rawMatches] = await Promise.all([
    pool.execute("SELECT ot.`group` AS group_number, ot.team_id, ot.initial_seed, ot.knockout_seed, t.name AS team_name, COALESCE(ot.manager_name_override, u.FFname) AS manager_name FROM OTHCupTeams ot LEFT JOIN Teams t ON t.teamID=ot.team_id AND t.year=ot.year LEFT JOIN Users u ON u.FFid=CASE WHEN t.initialOwner=-1 THEN t.ownerID ELSE t.initialOwner END WHERE ot.year=? ORDER BY ot.`group`, ot.initial_seed", [year]).then(([rows]) => rows),
    pool.execute("SELECT stage, round_number, first_week, second_week, status FROM OTHCupRounds WHERE year=? ORDER BY CASE stage WHEN 'group' THEN 1 WHEN 'knockout' THEN 2 ELSE 3 END, round_number", [year]).then(([rows]) => rows),
    pool.execute("SELECT stage, priority, tiebreak_type FROM OTHCupTiebreakers WHERE year=? ORDER BY stage, priority", [year]).then(([rows]) => rows),
    pool.execute("SELECT m.match_id, m.match_number, m.match_type, m.stage, m.group_number, m.round AS round_number, m.scoring_note, m.override_winning_team_id, m.team_one_score_override, m.team_two_score_override, m.team_one_id, t1.name AS team_one_name, COALESCE(ot1.manager_name_override, u1.FFname) AS team_one_manager, ot1.initial_seed AS team_one_initial_seed, ot1.knockout_seed AS team_one_knockout_seed, m.team_two_id, t2.name AS team_two_name, COALESCE(ot2.manager_name_override, u2.FFname) AS team_two_manager, ot2.initial_seed AS team_two_initial_seed, ot2.knockout_seed AS team_two_knockout_seed, r.first_week, r.second_week, r.status AS round_status FROM OTHCupMatches m JOIN OTHCupRounds r ON r.year=m.year AND r.stage=m.stage AND r.round_number=m.round LEFT JOIN Teams t1 ON t1.teamID=m.team_one_id AND t1.year=m.year LEFT JOIN Users u1 ON u1.FFid=CASE WHEN t1.initialOwner=-1 THEN t1.ownerID ELSE t1.initialOwner END LEFT JOIN OTHCupTeams ot1 ON ot1.year=m.year AND ot1.team_id=m.team_one_id LEFT JOIN Teams t2 ON t2.teamID=m.team_two_id AND t2.year=m.year LEFT JOIN Users u2 ON u2.FFid=CASE WHEN t2.initialOwner=-1 THEN t2.ownerID ELSE t2.initialOwner END LEFT JOIN OTHCupTeams ot2 ON ot2.year=m.year AND ot2.team_id=m.team_two_id WHERE m.year=? ORDER BY CASE m.stage WHEN 'group' THEN 1 WHEN 'knockout' THEN 2 ELSE 3 END, m.group_number, m.round, m.match_number", [year]).then(([rows]) => rows)
  ]);

  const scoreWeeks = [...new Set(rounds.flatMap(round => [round.first_week, round.second_week].filter(week => week !== null)))];
  let scoreRows = [];
  if (scoreWeeks.length) {
    const placeholders = scoreWeeks.map(() => "?").join(",");
    [scoreRows] = await pool.execute(
      `SELECT team_id, week, SUM(points) AS points FROM Scoring WHERE year=? AND week IN (${placeholders}) GROUP BY team_id, week`,
      [year, ...scoreWeeks]
    );
  }

  const scoreMap = new Map(scoreRows.map(row => [`${row.team_id}:${row.week}`, Number(row.points)]));
  const matches = rawMatches.map(match => decorateMatch(match, scoreMap));
  const cupTeams = teams.map(team => ({
    team_id: Number(team.team_id),
    team_name: team.team_name,
    manager_name: team.manager_name,
    group_number: team.group_number === null ? null : Number(team.group_number),
    initial_seed: Number(team.initial_seed),
    knockout_seed: team.knockout_seed === null ? null : Number(team.knockout_seed)
  }));
  const groups = [];
  const groupMap = new Map();
  for (const team of cupTeams) {
    if (team.group_number === null) continue;
    const groupNumber = team.group_number;
    if (!groupMap.has(groupNumber)) {
      const group = { group_number: groupNumber, group_label: toGroupLabel(groupNumber), teams: [], matches: [] };
      groupMap.set(groupNumber, group);
      groups.push(group);
    }
    groupMap.get(groupNumber).teams.push({
      team_id: Number(team.team_id),
      team_name: team.team_name,
      manager_name: team.manager_name,
      initial_seed: Number(team.initial_seed),
      knockout_seed: team.knockout_seed === null ? null : Number(team.knockout_seed)
    });
  }

  const groupMatches = matches.filter(match => match.stage === "group");
  for (const match of groupMatches) {
    const group = groupMap.get(Number(match.group_number));
    if (group) group.matches.push(match);
  }
  const groupTiebreakers = tiebreakers.filter(rule => rule.stage === "group");
  const advanceCount = tournaments[0].num_groups
    ? Math.floor(Number(tournaments[0].knockout_size) / Number(tournaments[0].num_groups))
    : 0;
  buildStandings(groups, groupMatches, groupTiebreakers, advanceCount);
  groups.sort((first, second) => first.group_number - second.group_number);
  for (const group of groups) {
    group.teams.sort((first, second) => first.place - second.place || first.initial_seed - second.initial_seed);
    group.matches.sort((first, second) => first.round_number - second.round_number || first.team_one_id - second.team_one_id || first.team_two_id - second.team_two_id);
  }

  const groupRounds = rounds.filter(round => round.stage === "group");
  const bracketStages = ["knockout", "second-chance"].map(stage => ({
    stage,
    rounds: rounds.filter(round => round.stage === stage).map(round => ({ ...round, matches: [] }))
  }));
  for (const bracketStage of bracketStages) {
    const roundMap = new Map(bracketStage.rounds.map(round => [Number(round.round_number), round]));
    for (const match of matches.filter(item => item.stage === bracketStage.stage)) {
      const round = roundMap.get(Number(match.round_number));
      if (round) round.matches.push(match);
    }
    for (const round of bracketStage.rounds) {
      round.matches.sort((first, second) => Number(first.match_number) - Number(second.match_number));
    }
  }
  const knockoutRounds = bracketStages[0].rounds;
  const knockoutMatches = knockoutRounds.flatMap(round => round.matches);
  if (Number(tournaments[0].is_double_elimination)) {
    buildDoubleEliminationLayout(bracketStages, teams, tournaments[0].knockout_size);
  } else {
    resolveTiedMatchesFromAdvancement(knockoutRounds);
    resolveScoringNotesFromAdvancement(knockoutRounds);
    assignBracketNumbers(knockoutMatches, teams, knockoutRounds);
  }

  let grandFinalStatus = null;
  if (Number(tournaments[0].is_double_elimination)) {
    const upperFinalRound = knockoutRounds.length >= 3 ? knockoutRounds[knockoutRounds.length - 3] : null;
    const grandFinalRound = knockoutRounds.length >= 2 ? knockoutRounds[knockoutRounds.length - 2] : null;
    const resetRound = knockoutRounds.length >= 3 ? knockoutRounds[knockoutRounds.length - 1] : null;
    const upperChampionId = upperFinalRound?.matches[0]?.winner_team_id ?? null;
    const grandFinalWinnerId = grandFinalRound?.matches[0]?.winner_team_id ?? null;
    grandFinalStatus = !grandFinalRound?.matches.length || !grandFinalWinnerId
      ? "pending"
      : upperChampionId === grandFinalWinnerId
        ? "reset-not-needed"
        : resetRound?.matches.length
          ? "reset-required"
          : "reset-pending";
  }

  return {
    available_years: availableYears,
    tournament: tournaments[0],
    tiebreakers,
    teams: cupTeams,
    group_rounds: groupRounds,
    groups,
    knockout_rounds: knockoutRounds,
    bracket_stages: Number(tournaments[0].is_double_elimination) ? bracketStages : [],
    grand_final_status: grandFinalStatus
  };
};
