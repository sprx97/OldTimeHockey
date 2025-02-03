import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Header, Grid, Dropdown, Tab } from 'semantic-ui-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, LineChart, Cell } from 'recharts';
import { getCurrentYear, isPlayoffWeek } from './Helpers';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}%
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LeaguePlayoffOdds = (props) => {
  const leagueId = props.match.params.leagueId;
  const location = useLocation();
  const leagueName = location.state?.leagueName || 'League';
  const passedTeamName = location.state?.selectedTeam;
  const passedOwnerName = location.state?.selectedOwner;

  const fetchPlayoffOdds = async () => {
    try {
      const response = await fetch(`https://roldtimehockey.com/node/v2/standings/advanced/playoff_odds?league=${leagueId}`);
      const data = await response.json();

      setPlayoffOdds(data);
      // If a team was passed via navigation, select it, otherwise select first team
      if (data && Object.keys(data).length > 0) {
        if (passedTeamName) {
          var team = passedTeamName ? Object.values(data).find(t => t.name === passedTeamName && t.owner === passedOwnerName) : null;
          setSelectedTeam(team || Object.values(data)[0]);
        } else {
          setSelectedTeam(Object.values(data)[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching playoff odds:', error);
    }
  };

  const [playoffOdds, setPlayoffOdds] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [historicalOdds, setHistoricalOdds] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState(new Set());

  useEffect(() => {
    fetchPlayoffOdds();
    fetchHistoricalOdds();
  }, [leagueId]);

  const handleLegendClick = (entry) => {
    setSelectedTeams(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(entry.dataKey)) {
        // If team is already selected, remove it
        newSelected.delete(entry.dataKey);
        // If removing the last selected team, clear selection to show all
        if (newSelected.size === 0) {
          return new Set();
        }
      } else {
        // Add the team to the selected set
        newSelected.add(entry.dataKey);
      }
      return newSelected;
    });
  };

  // Custom legend that shows selected/unselected states
  const CustomLegend = ({ payload }) => {
    const hasSelections = selectedTeams.size > 0;
    return (
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {payload.map((entry, index) => {
          const isSelected = selectedTeams.has(entry.dataKey);
          const isActive = !hasSelections || isSelected;
          return (
            <li
              key={`item-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: 20,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleLegendClick(entry)}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  backgroundColor: isActive ? entry.color : '#999',
                  marginRight: 5,
                  transition: 'background-color 0.2s ease'
                }}
              />
              <span style={{ color: isActive ? '#000' : '#666' }}>{entry.value}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const fetchHistoricalOdds = async () => {
    try {
      const weeklyData = {};
      const currentYear = getCurrentYear();
      let maxWeek = 1;
      while (!isPlayoffWeek(maxWeek, currentYear)) {
        maxWeek++;
      }
  
      // Fetch data for weeks 1 up to but not including the first playoff week
      const promises = Array.from({ length: maxWeek - 1 }, (_, i) => i + 1).map(week =>
        fetch(`https://roldtimehockey.com/node/v2/standings/advanced/playoff_odds?league=${leagueId}&week=${week}`)
          .then(res => res.json())
          .then(data => {
            weeklyData[week] = data;
          })
          .catch(error => {
            console.error(`Error fetching week ${week}:`, error);
          })
      );
      
      await Promise.all(promises);
      console.log(weeklyData)
      setHistoricalOdds(weeklyData);
    } catch (error) {
      console.error('Error fetching historical odds:', error);
    }
  };

  const formatSeedData = (seeds) => {
    if (!seeds) return [];
    return seeds.map((probability, index) => ({
      seed: `${index + 1}`,
      probability: probability
    }));
  };

  const formatRecordData = (records) => {
    if (!records) return [];
    return Object.entries(records).map(([record, data]) => ({
      record,
      odds: data.odds
    })).sort((a, b) => {
      // Sort by wins (first number in record)
      const aWins = parseInt(a.record.split('-')[0]);
      const bWins = parseInt(b.record.split('-')[0]);
      return bWins - aWins;
    });
  };

  const formatTeamOptions = (teams) => {
    if (!teams) return [];
    return Object.values(teams).map(team => ({
      key: team.name,
      text: `${team.owner} (${team.name})`,
      value: team.name
    }));
  };

  const handleTeamChange = (_, data) => {
    const team = Object.values(playoffOdds).find(t => t.name === data.value);
    setSelectedTeam(team);
  };

  const formatHistoricalData = () => {
    if (!historicalOdds || !playoffOdds) return { data: [], lines: [] };
    
    // Get current team IDs, names, and owners
    const teams = Object.entries(playoffOdds).map(([teamId, team]) => ({
      id: teamId,
      name: team.name,
      owner: team.owner
    }));
    
    // Create data points for each week where we have data
    const data = [];
    const availableWeeks = Object.entries(historicalOdds)
      .filter(([week, weekData]) => {
        const weekNum = Number(week);
        // Filter out playoff weeks and ensure we have data
        return weekData && 
              Object.keys(weekData).length > 0 && 
              !isPlayoffWeek(weekNum, getCurrentYear());
      })
      .map(([week]) => Number(week))
      .sort((a, b) => a - b);

    availableWeeks.forEach(week => {
      const weekData = historicalOdds[week];
      const weekPoint = { week };
      teams.forEach(team => {
        if (weekData[team.id]) {
          weekPoint[team.owner] = weekData[team.id].playoff_odds;
        }
      });
      data.push(weekPoint);
    });
    
    // Create line configurations
    const lines = teams.map((team, index) => ({
      name: team.owner,
      dataKey: team.owner,
      type: "monotone",
      stroke: [
        '#F47A38', // ANA Orange
        '#002654', // BUF Navy
        '#C8102E', // CGY Red
        '#006847', // DAL Green
        '#041E42', // EDM Dark Blue
        '#024930', // MIN Forest Green
        '#00539B', // NYI Blue
        '#0038A8', // NYR Royal Blue
        '#F74902', // PHI Orange
        '#006D75', // SJS Teal
        '#99D9D9', // SEA Light Blue
        '#002F87', // STL Blue
        '#B4975A', // VGK Gold
        '#C8102E'  // WSH Red
      ][index % 14],
      dot: { r: 3, fill: [
        '#F47A38', // ANA Orange
        '#002654', // BUF Navy
        '#C8102E', // CGY Red
        '#006847', // DAL Green
        '#041E42', // EDM Dark Blue
        '#024930', // MIN Forest Green
        '#00539B', // NYI Blue
        '#0038A8', // NYR Royal Blue
        '#F74902', // PHI Orange
        '#006D75', // SJS Teal
        '#99D9D9', // SEA Light Blue
        '#002F87', // STL Blue
        '#B4975A', // VGK Gold
        '#C8102E'  // WSH Red
      ][index % 14] },
      strokeWidth: 2,
      connectNulls: true,
      isAnimationActive: false
    }));
    
    console.log('Formatted data:', data);
    return { data, lines };
  };

  const renderLeagueWideTab = () => (
    <div>
      <Header as="h2" style={{fontSize: "1.25rem", paddingLeft: 5, paddingTop: 15}}>Current Playoff Odds</Header>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={Object.values(playoffOdds)
            .sort((a, b) => b.playoff_odds - a.playoff_odds)
            .map(team => ({
              name: team.name,
              odds: team.playoff_odds,
              owner: team.owner
            }))}
          margin={{ top: 20, right: 30, bottom: 60, left: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="owner"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            label={{ value: 'Manager Name', position: 'bottom', offset: 50 }}
          />
          <YAxis
            label={{ value: 'Playoff Odds %', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    <p><strong>{data.owner}</strong></p>
                    <p>Team: {data.name}</p>
                    <p>Playoff Odds: {data.odds.toFixed(2)}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="odds"
            fill="#355464"
            name="Playoff Odds"
            barSize={30}
          >
            {Object.values(playoffOdds)
              .sort((a, b) => b.playoff_odds - a.playoff_odds)
              .map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.playoff_odds >= 90 ? '#006847' : // Dallas Stars Green
                    entry.playoff_odds >= 70 ? '#0038A8' : // NY Rangers Blue
                    entry.playoff_odds >= 40 ? '#F47A38' : // Anaheim Ducks Orange
                    entry.playoff_odds >= 10 ? '#AF1E2D' : // New Jersey Devils Dark Red
                    '#CE1126'  // Detroit Red Wings Red for missing the playoffs lmao
                  }
                />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Header as="h2" style={{fontSize: "1.25rem", paddingLeft: 5, paddingTop: 15}}>Historical Playoff Odds</Header>
      <ResponsiveContainer width="100%" height={600}>
        <LineChart
          margin={{ top: 20, right: 30, bottom: 60, left: 30 }}
          data={formatHistoricalData().data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'Week', position: 'bottom', offset: 0 }}
            allowDecimals={false}
            ticks={(() => {
              const data = formatHistoricalData().data;
              // Only use weeks where we actually have data
              return data.map(d => d.week);
            })()}
          />
          <YAxis
            label={{ value: 'Playoff Odds %', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    {payload.map((entry, index) => (
                      <div key={index} style={{ color: entry.color }}>
                        <strong>{entry.name}</strong>: {entry.value?.toFixed(1)}%
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend content={<CustomLegend />} />
          {formatHistoricalData().lines.map(line => {
            const hasSelections = selectedTeams.size > 0;
            const isSelected = selectedTeams.has(line.name);
            const isActive = !hasSelections || isSelected;
            return (
              <Line 
                key={line.name} 
                {...line}
                stroke={isActive ? line.stroke : '#999'}
                strokeWidth={isActive ? 2 : 1}
                dot={{ ...line.dot, fill: isActive ? line.dot.fill : '#999', r: isActive ? 3 : 2 }}
                opacity={isActive ? 1 : 0.3}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderIndividualTab = () => (
    <div>
      <Dropdown
        placeholder="Select Team"
        fluid
        selection
        options={formatTeamOptions(playoffOdds)}
        value={selectedTeam?.name}
        onChange={handleTeamChange}
        style={{ marginBottom: '20px', border: '1px solid #ccc' }}
      />
      {selectedTeam && (
        <div>
          <Grid columns={4} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '15px', width: '100%', maxWidth: '1200px', boxSizing: 'border-box', margin: '0 auto'}} stackable>
            <Grid.Column>
              <p style={{textAlign: 'center'}}><strong>Current Record</strong><br/>{selectedTeam.wins}-{selectedTeam.losses}</p>
            </Grid.Column>
            <Grid.Column>
              <p style={{textAlign: 'center'}}><strong>Total PF</strong><br/>{selectedTeam.PF}</p>
            </Grid.Column>
            <Grid.Column>
              <p style={{textAlign: 'center'}}><strong>PF per Week</strong><br/>{selectedTeam.PF_avg.toFixed(1)}</p>
            </Grid.Column>
            <Grid.Column>
              <p style={{textAlign: 'center'}}><strong>Playoff Odds</strong><br/>{selectedTeam.playoff_odds}%</p>
            </Grid.Column>
          </Grid>

          <Grid columns={2} stackable style={{paddingTop: 25}}>
            <Grid.Row>
              <Grid.Column>
                <Header as="h3" style={{margin: 0}} align="center">Playoff Seed Probabilities</Header>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={formatSeedData(selectedTeam.seeds)}
                    margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="seed"
                      label={{ value: 'Playoff Seed', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      label={{ value: 'Probability %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Bar dataKey="probability" fill="#99D9D9" name="Probability %" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3" style={{margin: 0}} align="center">Record-Based Playoff Odds</Header>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={formatRecordData(selectedTeam.records)}
                    margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="record"
                      label={{ value: 'Record', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      label={{ value: 'Probability %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Bar dataKey="odds" fill="#355464" name="Playoff Odds %" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header as="h3" style={{margin: 0}} align="center">Current Week Impact on Playoff Odds</Header>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart 
                    data={[
                      {
                        scenario: 'Win',
                        current: selectedTeam.playoff_odds || 0,
                        projected: selectedTeam.current_week?.win?.odds || 0
                      },
                      {
                        scenario: 'Loss',
                        current: selectedTeam.playoff_odds || 0,
                        projected: selectedTeam.current_week?.loss?.odds || 0
                      }
                    ]}
                    margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis 
                      domain={[0, 100]} 
                      ticks={[0, 20, 40, 60, 80, 100]}
                      label={{ value: 'Percentage %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
           
                    <Bar 
                      dataKey="current" 
                      fill="#99D9D9"
                      name="Current Odds"
                      barSize={30}
                    />
                    <Bar 
                      dataKey="projected" 
                      fill="#355464"
                      name="Projected Odds"
                      barSize={30}
                    />
                  </ComposedChart>
                  
                </ResponsiveContainer>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      )}
    </div>
  );

  const panes = [
    {
      menuItem: 'League Wide Odds',
      render: () => (
        <Tab.Pane>
          {playoffOdds && renderLeagueWideTab()}
        </Tab.Pane>
      )
    },
    {
      menuItem: 'Individual Manager Odds',
      render: () => (
        <Tab.Pane>
          {playoffOdds && renderIndividualTab()}
        </Tab.Pane>
      )
    }
  ];

  return (
    <Container style={{ marginTop: '2rem', padding: '0' }}>
      <Header as="h1">{leagueName} - Playoff Odds</Header>
      <Tab panes={panes} defaultActiveIndex={passedTeamName ? 1 : 0} />
    </Container>
  );
};

export default LeaguePlayoffOdds;
