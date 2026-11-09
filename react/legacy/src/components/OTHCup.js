import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './OTHCup.css';

const scoreText = value => value === null || value === undefined ? '—' : Number(value).toFixed(2);
const roundTitle = (round, isDoubleElimination = false) => {
  if (isDoubleElimination) return `Round ${round.round_number}`;
  const entries = Number(round.matches?.length || 0) * 2;
  if (entries === 2) return 'Final';
  if (entries === 4) return 'Semifinals';
  return `Round of ${entries}`;
};
const roundWeeksLabel = round => {
  const weekCount = [round.first_week, round.second_week].filter(week => week !== null && week !== undefined).length;
  return `${weekCount === 1 ? 'Week' : 'Weeks'} ${round.first_week}${round.second_week ? `–${round.second_week}` : ''}`;
};

function OTHCup() {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [spotlight, setSpotlight] = useState('');
  const [groupViews, setGroupViews] = useState({});
  const [groupMatchRounds, setGroupMatchRounds] = useState({});
  const [doubleBracketTab, setDoubleBracketTab] = useState('knockout');
  const bracketScrollerRef = useRef(null);
  const bracketDrag = useRef(null);
  const yearParam = params.get('year') || '2026';
  const hasGroupStage = Number(data?.tournament?.num_groups || 0) > 0;
  const stage = params.get('stage') === 'knockout' || !hasGroupStage ? 'knockout' : 'group';
  const selectedGroup = params.get('group') || 'all';
  const startRound = Number(params.get('round') || 1);
  const zoom = Number(params.get('zoom') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(location.search);
    if (value === null || value === undefined || value === '') next.delete(key);
    else next.set(key, String(value));
    history.replace({ pathname: location.pathname, search: next.toString() ? `?${next}` : '' });
  };

  const setYear = value => {
    const next = new URLSearchParams(location.search);
    next.set('year', String(value));
    next.delete('round');
    history.replace({ pathname: location.pathname, search: `?${next}` });
  };

  const startBracketDrag = event => {
    if (event.button !== 0 || event.pointerType === 'touch' || event.target.closest('button, select, a')) return;
    bracketDrag.current = { x: event.clientX, y: event.clientY, scrollLeft: bracketScrollerRef.current.scrollLeft, scrollY: window.scrollY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveBracketDrag = event => {
    if (!bracketDrag.current) return;
    const deltaX = event.clientX - bracketDrag.current.x;
    const deltaY = event.clientY - bracketDrag.current.y;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
      bracketScrollerRef.current.classList.add('dragging');
      bracketScrollerRef.current.scrollLeft = bracketDrag.current.scrollLeft - deltaX;
      window.scrollTo(0, bracketDrag.current.scrollY - deltaY);
      event.preventDefault();
    }
  };

  const stopBracketDrag = () => {
    bracketDrag.current = null;
    bracketScrollerRef.current?.classList.remove('dragging');
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetch(`/node/v2/othcup${yearParam ? `?year=${encodeURIComponent(yearParam)}` : ''}`)
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Could not load OTH Cup data.');
        return body;
      })
      .then(body => {
        if (!active) return;
        setData(body);
        if (!yearParam && body.tournament) setParam('year', body.tournament.year);
      })
      .catch(reason => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [yearParam]);

  const groups = data?.groups || [];
  const rounds = data?.knockout_rounds || [];
  const tournament = data?.tournament;
  const knockoutStartWeek = rounds.find(round => round.first_week !== null && round.first_week !== undefined)?.first_week;
  const isDoubleElimination = Number(tournament?.is_double_elimination) === 1;
  const hasGroupData = groups.some(group => group.matches.length > 0);
  const filteredGroups = useMemo(() => selectedGroup === 'all' ? groups : groups.filter(group => String(group.group_number) === selectedGroup), [groups, selectedGroup]);
  const selectedDoubleStage = (data?.bracket_stages || []).find(item => item.stage === doubleBracketTab);
  const doubleRoundsRaw = selectedDoubleStage?.rounds || [];
  const doubleRounds = doubleBracketTab === 'knockout' && data?.grand_final_status === 'reset-not-needed'
    ? doubleRoundsRaw.filter(round => Number(round.round_number) !== Number(rounds[rounds.length - 1]?.round_number))
    : doubleRoundsRaw;
  const roundPickerRounds = isDoubleElimination ? doubleRounds : rounds;
  const effectiveStartRound = roundPickerRounds.some(round => Number(round.round_number) === startRound)
    ? startRound
    : Number(roundPickerRounds[0]?.round_number || 1);
  const activeRounds = rounds.filter(round => Number(round.round_number) >= effectiveStartRound);
  const hasBracketData = isDoubleElimination
    ? (data?.bracket_stages || []).some(item => item.rounds.some(round => round.matches.length > 0))
    : rounds.some(round => round.matches.length > 0);
  const rowHeight = 72;
  const firstVisibleRound = activeRounds[0];
  const bracketRows = Math.max(1, Number(firstVisibleRound?.matches?.length || 1));
  const bracketHeight = bracketRows * rowHeight;
  const teamOptions = useMemo(() => (data?.teams || groups.flatMap(group => group.teams)).sort((a, b) => a.manager_name?.localeCompare(b.manager_name || '') || a.initial_seed - b.initial_seed), [data?.teams, groups]);
  const knockoutTiebreakOrder = (data?.tiebreakers || [])
    .filter(rule => rule.stage === 'knockout')
    .sort((first, second) => Number(first.priority) - Number(second.priority))
    .map(rule => rule.tiebreak_type);
  const tiebreakTooltip = [
    'Advanced via tiebreak:',
    ...knockoutTiebreakOrder.map((rule, index) => `${index + 1}. ${rule}`)
  ].join('\n');
  const lastKnockoutRound = rounds[rounds.length - 1];
  const resetWinnerMatch = lastKnockoutRound?.matches.find(match => match.winner_team_id !== null && match.winner_team_id !== undefined);
  const grandFinalRound = isDoubleElimination ? rounds[rounds.length - 2] : null;
  const championshipMatchId = isDoubleElimination
    ? (resetWinnerMatch?.match_id ?? (data?.grand_final_status === 'reset-not-needed' ? grandFinalRound?.matches.find(match => match.winner_team_id !== null && match.winner_team_id !== undefined)?.match_id : null))
    : lastKnockoutRound?.matches.find(match => match.winner_team_id !== null && match.winner_team_id !== undefined)?.match_id;

  const renderMatch = (match, round, style = {}) => {
    const isSpotlight = spotlight && [match.team_one_id, match.team_two_id].includes(Number(spotlight));
    const matchInfoText = match.scoring_note || (match.tiebreak_resolved_by_advancement ? tiebreakTooltip : null);
    const teamOneId = match.team_one_id === null ? null : Number(match.team_one_id);
    const teamTwoId = match.team_two_id === null ? null : Number(match.team_two_id);
    const winnerId = Number(match.override_winning_team_id ?? match.winner_team_id);
    const championMatch = Number(match.match_id) === Number(championshipMatchId);
    const isInProgress = match.round_status === 'in progress';
    const matchName = match.match_type === 'pending' ? 'Awaiting advancement' : null;
    const droppedInSides = match.stage === 'second-chance'
      ? new Set((match.generated_sources || [])
        .filter(source => source.source_stage === 'knockout' && source.result === 'loser')
        .map(source => source.side))
      : new Set();
    return (
      <div style={style} className={`cup-match ${isInProgress ? 'in-progress' : ''} ${match.winner_team_id ? 'has-winner' : ''} ${match.is_tie ? 'is-tie' : ''} ${match.match_type === 'bye' ? 'is-bye' : ''} ${match.match_type === 'pending' ? 'is-pending' : ''} ${match.pairing_consistent === false ? 'pairing-alert' : ''} ${spotlight && !isSpotlight ? 'dimmed' : ''}`} key={match.match_id || `${match.stage}-${match.group_number || 0}-${match.round_number}-${match.match_number}`}>
        {isInProgress && <span className="cup-in-progress-badge">In Progress</span>}
        {matchName && <div className="cup-match-node-label">{matchName}</div>}
        <div className={`cup-match-side ${winnerId === teamOneId ? 'winner' : ''}`}>
          <span className="cup-match-seed">{match.stage !== 'group' ? (match.team_one_knockout_seed || '') : (match.team_one_initial_seed || '')}</span>
          <span className="cup-match-manager"><span className="cup-match-manager-name">{match.match_type === 'bye' && !teamOneId ? 'BYE' : match.team_one_manager || match.team_one_name || `Team ${match.team_one_id || 'TBD'}`}</span>{droppedInSides.has('one') && <span className="cup-drop-in-indicator" role="img" aria-label="Dropped in from upper bracket" title="Dropped in from upper bracket">⬇️</span>}{championMatch && winnerId === teamOneId && <span className="cup-champion-medal" role="img" aria-label="Tournament champion">🥇</span>}</span>
          <div className="cup-match-score">{match.match_type !== 'bye' && matchInfoText && winnerId === teamOneId && <span className="cup-tiebreak-info" role="img" tabIndex="0" aria-label={matchInfoText} title={matchInfoText}><span>?</span></span>}<strong>{scoreText(match.match_type === 'bye' ? null : match.score_one)}</strong></div>
        </div>
        <div className={`cup-match-side ${winnerId === teamTwoId ? 'winner' : ''}`}>
          <span className="cup-match-seed">{match.stage !== 'group' ? (match.team_two_knockout_seed || '') : (match.team_two_initial_seed || '')}</span>
          <span className="cup-match-manager"><span className="cup-match-manager-name">{match.match_type === 'bye' && !teamTwoId ? 'BYE' : match.team_two_manager || match.team_two_name || `Team ${match.team_two_id || 'TBD'}`}</span>{droppedInSides.has('two') && <span className="cup-drop-in-indicator" role="img" aria-label="Dropped in from upper bracket" title="Dropped in from upper bracket">⬇️</span>}{championMatch && winnerId === teamTwoId && <span className="cup-champion-medal" role="img" aria-label="Tournament champion">🥇</span>}</span>
          <div className="cup-match-score">{match.match_type !== 'bye' && matchInfoText && winnerId === teamTwoId && <span className="cup-tiebreak-info" role="img" tabIndex="0" aria-label={matchInfoText} title={matchInfoText}><span>?</span></span>}<strong>{scoreText(match.match_type === 'bye' ? null : match.score_two)}</strong></div>
        </div>
        {match.is_tie && <div className="cup-match-foot">Tie to resolve</div>}
      </div>
    );
  };

  const renderLinearConnector = (outerRound, innerRound) => {
    const span = 2 ** (Number(outerRound.round_number) - startRound);
    const width = 24;
    const paths = innerRound.matches.map((match, index) => {
        const firstY = (index * 2 * span + span / 2) * rowHeight;
        const secondY = ((index * 2 + 1) * span + span / 2) * rowHeight;
        const middleY = (firstY + secondY) / 2;
        return `M0 ${firstY} H${width / 2} V${secondY} M0 ${secondY} H${width / 2} M${width / 2} ${middleY} H${width}`;
      });
    return <svg className="cup-linear-round-connector" viewBox={`0 0 ${width} ${bracketHeight}`} preserveAspectRatio="none" aria-hidden="true" key={`connector-${outerRound.round_number}`}>
      {paths.map((path, index) => <path d={path} key={index} />)}
    </svg>;
  };

  const renderSingleEliminationBracket = () => <div className="cup-linear-bracket" style={{ '--bracket-zoom': zoom, '--cup-bracket-height': `${bracketHeight}px`, '--cup-grid-rows': bracketRows, '--cup-row-height': `${rowHeight}px` }}>
    {activeRounds.map((round, index) => {
      const span = 2 ** (Number(round.round_number) - startRound);
      return [
        <article className="cup-bracket-round" key={`round-${round.round_number}`}>
          <header><span>{roundTitle(round)}</span><small>{roundWeeksLabel(round)}</small></header>
          <div className="cup-round-matches">
            {round.matches.map((match, matchIndex) => renderMatch(match, round, { gridRow: `${matchIndex * span + 1} / span ${span}` }))}
          </div>
        </article>,
        index < activeRounds.length - 1 ? renderLinearConnector(round, activeRounds[index + 1]) : null
      ];
    })}
  </div>;

  const renderDoubleEliminationStage = () => {
    const matchSpacing = 72;
    const matchHalfHeight = 27;
    const positions = new Map();
    const roundsForStage = doubleRounds.filter(round => Number(round.round_number) >= effectiveStartRound);
    const compactFilteredRounds = effectiveStartRound > Number(doubleRounds[0]?.round_number || 1);
    if (compactFilteredRounds) {
      roundsForStage.forEach(round => {
        const orderedMatches = round.matches
          .filter(match => match.match_type !== 'bye')
          .sort((first, second) =>
            Number(first.generated_bracket_row ?? Infinity) - Number(second.generated_bracket_row ?? Infinity) ||
            Number(first.match_number) - Number(second.match_number)
          );
        const placements = orderedMatches.map((match, index) => {
          const sourceCenters = [...new Set((match.generated_sources || []).map(source => source.match_id))]
            .map(sourceId => positions.get(Number(sourceId)))
            .filter(Number.isFinite);
          return {
            match,
            center: sourceCenters.length
              ? sourceCenters.reduce((total, center) => total + center, 0) / sourceCenters.length
              : (index + 0.5) * matchSpacing
          };
        });
        placements.sort((first, second) => first.center - second.center || Number(first.match.match_number) - Number(second.match.match_number));
        const separated = [];
        for (const placement of placements) {
          const previous = separated[separated.length - 1];
          separated.push(previous ? Math.max(placement.center, previous + matchSpacing) : placement.center);
        }
        const offset = placements.length
          ? (placements.reduce((total, placement) => total + placement.center, 0) - separated.reduce((total, center) => total + center, 0)) / placements.length
          : 0;
        placements.forEach((placement, index) => {
          positions.set(Number(placement.match.match_id), separated[index] + offset);
        });
      });
      if (positions.size) {
        const positionOffset = Math.min(...positions.values()) - matchSpacing / 2;
        for (const [matchId, center] of positions) positions.set(matchId, center - positionOffset);
      }
    } else {
      const visibleCenters = roundsForStage.flatMap(round => round.matches)
        .map(match => Number(match.generated_bracket_row) * matchSpacing)
        .filter(Number.isFinite);
      const positionOffset = visibleCenters.length ? Math.min(...visibleCenters) - matchSpacing / 2 : 0;
      roundsForStage.forEach(round => round.matches.forEach((match, index) => {
        const generatedCenter = Number(match.generated_bracket_row) * matchSpacing;
        positions.set(Number(match.match_id), Number.isFinite(generatedCenter)
          ? generatedCenter - positionOffset
          : (index + 0.5) * matchSpacing);
      }));
    }
    const maxCenter = Math.max(matchSpacing / 2, ...positions.values());
    const height = maxCenter + matchSpacing / 2;
    const matchMap = new Map(roundsForStage.flatMap(round => round.matches).map(match => [Number(match.match_id), match]));
    const hiddenByeIds = new Set(roundsForStage.flatMap(round => round.matches)
      .filter(match => match.match_type === 'bye')
      .map(match => Number(match.match_id)));
    const edges = (selectedDoubleStage?.feeders || []).filter(edge =>
      matchMap.has(Number(edge.source_match_id)) &&
      matchMap.has(Number(edge.target_match_id)) &&
      !hiddenByeIds.has(Number(edge.source_match_id))
    );
    const width = roundsForStage.length * 180;
    return <div className="cup-double-bracket" style={{ '--bracket-zoom': zoom, '--cup-double-height': `${height}px`, '--cup-double-width': `${width}px` }}>
      <svg className="cup-double-feeders" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {edges.map((edge, index) => {
          const source = matchMap.get(Number(edge.source_match_id));
          const target = matchMap.get(Number(edge.target_match_id));
          const sourceRound = roundsForStage.findIndex(round => round.matches.some(match => Number(match.match_id) === Number(edge.source_match_id)));
          const targetRound = roundsForStage.findIndex(round => round.matches.some(match => Number(match.match_id) === Number(edge.target_match_id)));
          const x1 = sourceRound * 180 + 156;
          const x2 = targetRound * 180;
          const y1 = positions.get(Number(source.match_id));
          const y2 = positions.get(Number(target.match_id));
          const elbow = Math.max(x1 + 8, (x1 + x2) / 2);
          return <path key={index} className={`cup-double-feeder ${edge.result === 'loser' ? 'loser-feeder' : ''}`} d={`M${x1} ${y1} H${elbow} V${y2} H${x2}`} />;
        })}
      </svg>
      {roundsForStage.map(round => <article className="cup-double-round-column" key={`${round.stage}-${round.round_number}`}>
        <header><span>{roundTitle(round, true)}</span><small>{roundWeeksLabel(round)}</small></header>
        <div className="cup-double-round-canvas" style={{ height: `${height}px` }}>
          {round.matches.filter(match => !hiddenByeIds.has(Number(match.match_id))).map(match => renderMatch(match, round, { position: 'absolute', top: `${positions.get(Number(match.match_id)) - matchHalfHeight}px`, left: 0, right: 0 }))}
        </div>
      </article>)}
    </div>;
  };

  return (
    <main className="othcup-page">
      <section className="cup-hero">
        <div>
          <div className="cup-eyebrow">OLD TIME HOCKEY · ANNUAL TOURNAMENT</div>
          <h1>OTH <span>Cup</span></h1>
        </div>
        <label className="cup-year-picker">Season
          <select value={yearParam || tournament?.year || ''} onChange={event => setYear(event.target.value)}>
            {(data?.available_years || []).map(year => <option key={year.year} value={year.year}>{year.year}-{String(Number(year.year) + 1).slice(-2)}</option>)}
          </select>
        </label>
        {tournament && <div className="cup-status"><span className={`status-dot status-${String(tournament.status).replace(/ /g, '-')}`} />{tournament.status}</div>}
      </section>

      {loading && <div className="cup-state">Loading the Cup…</div>}
      {error && <div className="cup-state cup-error">{error}</div>}
      {!loading && !error && tournament && <>
        <section className="cup-toolbar">
          <div className="cup-switch" role="tablist" aria-label="Tournament stage">
            {hasGroupStage && <button className={stage === 'group' ? 'selected' : ''} onClick={() => setParam('stage', 'group')}>Group stage</button>}
            <button className={stage === 'knockout' ? 'selected' : ''} onClick={() => setParam('stage', 'knockout')}>Bracket</button>
          </div>
          <div className="cup-tournament-facts"><span><b>{tournament.num_entries}</b> teams</span>{hasGroupStage && <span><b>{tournament.num_groups}</b> groups</span>}<span><b>{tournament.knockout_size}</b> {isDoubleElimination ? 'double-elimination' : 'single-elimination'}</span></div>
        </section>

        {stage === 'group' ? !hasGroupData ? <section className="cup-empty-bracket">
          <span className="cup-card-kicker">GROUP STAGE</span>
          <h2>{tournament.status === 'upcoming' ? 'Coming soon' : 'Group stage information unavailable'}</h2>
          <p>{tournament.status === 'upcoming' ? 'The group stage will appear here when the tournament begins.' : 'Group stage data is not available for this tournament.'}</p>
        </section> : <>
          <section className="cup-subtoolbar">
            <label>Group <select value={selectedGroup} onChange={event => setParam('group', event.target.value === 'all' ? null : event.target.value)}><option value="all">All groups</option>{groups.map(group => <option key={group.group_number} value={group.group_number}>{group.group_label}</option>)}</select></label>
          </section>
          <section className="cup-groups-grid">
            {filteredGroups.map(group => <article className="cup-group-card" key={group.group_number}>
              {(() => {
                const groupView = groupViews[group.group_number] || 'standings';
                const groupRounds = data?.group_rounds || [];
                const requestedRound = groupMatchRounds[group.group_number];
                const defaultRound = groupRounds.find(round => round.status === 'in progress') || groupRounds[0];
                const selectedRound = groupRounds.find(round => Number(round.round_number) === Number(requestedRound)) || defaultRound;
                const dayMatches = selectedRound ? group.matches.filter(match => Number(match.round_number) === Number(selectedRound.round_number)) : [];
                return <>
                  <header className="cup-group-header">
                    <div><span className="cup-card-kicker">GROUP</span><h2>{group.group_label}</h2><span className="cup-qualify-note">Top {Math.floor(tournament.knockout_size / tournament.num_groups)} advance</span></div>
                    <div className="cup-group-header-controls">
                      <div className="cup-group-view-toggle" role="group" aria-label={`Group ${group.group_label} display`}>
                        <button className={groupView === 'standings' ? 'selected' : ''} onClick={() => setGroupViews(current => ({ ...current, [group.group_number]: 'standings' }))}>Standings</button>
                        <button className={groupView === 'matches' ? 'selected' : ''} onClick={() => setGroupViews(current => ({ ...current, [group.group_number]: 'matches' }))}>Matches</button>
                      </div>
                      {groupView === 'matches' && <label className="cup-matchday-picker">Match day <select value={selectedRound?.round_number || ''} onChange={event => setGroupMatchRounds(current => ({ ...current, [group.group_number]: event.target.value }))}>
                        {groupRounds.map(round => <option key={round.round_number} value={round.round_number}>Day {round.round_number} · Week {round.first_week}</option>)}
                      </select></label>}
                    </div>
                  </header>
                  {groupView === 'standings' ? <div className="cup-table-wrap"><table><thead><tr><th>#</th><th>Manager</th><th>W-L-T</th><th>PF</th></tr></thead><tbody>{group.teams.map(team => <tr key={team.team_id} className={`${team.qualified ? 'qualifier' : ''} ${team.tiebreak_unresolved ? 'unresolved' : ''}`}>
                    <td>{team.place}</td><td><span className="manager-name">{team.manager_name || team.team_name || `Team ${team.team_id}`}</span><small>Seed {team.initial_seed}</small></td><td>{team.wins}-{team.losses}-{team.ties}</td><td>{Number(team.points_for).toFixed(2)}</td>
                  </tr>)}</tbody></table></div> : <div className="cup-group-matches">{dayMatches.map((match, index) => {
                    const teamOneId = Number(match.team_one_id);
                    const teamTwoId = Number(match.team_two_id);
                    const winnerId = Number(match.override_winning_team_id ?? match.winner_team_id);
                    const matchInfoText = match.scoring_note;
                    const isInProgress = match.round_status === 'in progress';
                    return <div key={`${match.round_number}-${index}`} className={`cup-group-match-row ${isInProgress ? 'in-progress' : ''}`}>{isInProgress && <span className="cup-in-progress-badge">In Progress</span>}<div className="cup-group-match-sides">
                      <div className={`cup-group-match-side ${winnerId === teamOneId ? 'winner' : ''}`}><span>{match.team_one_manager || match.team_one_name}</span><b>{matchInfoText && winnerId === teamOneId && <span className="cup-tiebreak-info" role="img" tabIndex="0" aria-label={matchInfoText} title={matchInfoText}><span>?</span></span>}{scoreText(match.score_one)}</b></div>
                      <div className={`cup-group-match-side ${winnerId === teamTwoId ? 'winner' : ''}`}><span>{match.team_two_manager || match.team_two_name}</span><b>{matchInfoText && winnerId === teamTwoId && <span className="cup-tiebreak-info" role="img" tabIndex="0" aria-label={matchInfoText} title={matchInfoText}><span>?</span></span>}{scoreText(match.score_two)}</b></div>
                    </div></div>;
                  })}</div>}
                </>;
              })()}
            </article>)}
          </section>
        </> : !hasBracketData ? <section className="cup-empty-bracket">
          <span className="cup-card-kicker">KNOCKOUT BRACKET</span>
          <h2>{tournament.status === 'upcoming' ? 'Coming soon' : tournament.status === 'in progress' ? 'The bracket stage has not started yet' : 'Bracket information unavailable'}</h2>
          <p>{tournament.status === 'upcoming' ? 'The knockout bracket will appear here when the tournament begins.' : tournament.status === 'in progress' ? (knockoutStartWeek ? `The bracket stage starts in Week ${knockoutStartWeek}.` : 'The bracket stage has not started yet.') : 'Bracket data is not available for this tournament.'}</p>
        </section> : <>
          <section className="cup-bracket-tools">
            <label>Start at <select value={effectiveStartRound} onChange={event => setParam('round', event.target.value)}>{roundPickerRounds.map(round => <option key={round.round_number} value={round.round_number}>{roundTitle(round, isDoubleElimination)}</option>)}</select></label>
            <div className="zoom-tools"><button onClick={() => setParam('zoom', Math.max(0.75, zoom - 0.1).toFixed(2))} aria-label="Zoom out">−</button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setParam('zoom', Math.min(1.2, zoom + 0.1).toFixed(2))} aria-label="Zoom in">+</button></div>
            <label className="spotlight-picker">Follow manager <select value={spotlight} onChange={event => setSpotlight(event.target.value)}><option value="">All teams</option>{teamOptions.map(team => <option key={team.team_id} value={team.team_id}>{team.manager_name || team.team_name}</option>)}</select></label>
          </section>
          {rounds.some(round => round.matches.some(match => match.pairing_consistent === false)) && <div className="cup-alert">Saved bracket pairings do not match the current scoring winners. A later scoring correction may have changed the path.</div>}
          {rounds.some(round => round.matches.some(match => match.is_tie)) && <div className="cup-alert tie-alert">A knockout game is tied and needs a manual tiebreak result.</div>}
          {isDoubleElimination ? <section ref={bracketScrollerRef} className="cup-bracket-scroller" onPointerDown={startBracketDrag} onPointerMove={moveBracketDrag} onPointerUp={stopBracketDrag} onPointerCancel={stopBracketDrag}>
            <div className="cup-double-stage-tabs" role="tablist" aria-label="Double-elimination bracket">
              <button className={doubleBracketTab === 'knockout' ? 'selected' : ''} onClick={() => setDoubleBracketTab('knockout')}>Winners</button>
              <button className={doubleBracketTab === 'second-chance' ? 'selected' : ''} onClick={() => setDoubleBracketTab('second-chance')}>Second-chance</button>
            </div>
            {renderDoubleEliminationStage()}
          </section> : <section ref={bracketScrollerRef} className="cup-bracket-scroller" onPointerDown={startBracketDrag} onPointerMove={moveBracketDrag} onPointerUp={stopBracketDrag} onPointerCancel={stopBracketDrag}>{renderSingleEliminationBracket()}</section>}
        </>}
      </>}
    </main>
  );
}

export default OTHCup;
