import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Header, Grid, Dropdown } from 'semantic-ui-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const LeaguePlayoffOdds = (props) => {
  const leagueId = props.match.params.leagueId;
  const location = useLocation();
  const leagueName = location.state?.leagueName || 'League';
  const [playoffOdds, setPlayoffOdds] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchPlayoffOdds = async () => {
      try {
        const response = await fetch(`https://roldtimehockey.com/node/v2/standings/advanced/playoff_odds?league=${leagueId}`);
        const data = await response.json();
        setPlayoffOdds(data);
        // Set the first team as selected by default
        if (data && Object.keys(data).length > 0) {
          setSelectedTeam(Object.values(data)[0]);
        }
      } catch (error) {
        console.error('Error fetching playoff odds:', error);
      }
    };
    
    fetchPlayoffOdds();
  }, [leagueId]);

  const formatSeedData = (seeds) => {
    if (!seeds) return [];
    return seeds.map((probability, index) => ({
      seed: `Seed ${index + 1}`,
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

  const formatCurrentWeekData = (currentWeek) => {
    if (!currentWeek) return [];
    return [
      { name: 'Win', value: currentWeek.win.odds },
      { name: 'Loss', value: currentWeek.loss.odds }
    ];
  };

  const formatTeamOptions = (teams) => {
    if (!teams) return [];
    return Object.values(teams).map(team => ({
      key: team.name,
      text: `${team.name} (${team.owner})`,
      value: team.name
    }));
  };

  const handleTeamChange = (_, data) => {
    const team = Object.values(playoffOdds).find(t => t.name === data.value);
    setSelectedTeam(team);
  };

  return (
    <Container style={{ marginTop: '2rem' }}>
      <Header as="h1">{leagueName} - League Playoff Odds</Header>
      {playoffOdds && (
        <Dropdown
          placeholder="Select Team"
          fluid
          selection
          options={formatTeamOptions(playoffOdds)}
          value={selectedTeam?.name}
          onChange={handleTeamChange}
          style={{ marginBottom: '20px' }}
        />
      )}
      {selectedTeam && (
        <div>

          <p>Current Record: {selectedTeam.wins}-{selectedTeam.losses}</p>
          <p>Total PF: {selectedTeam.PF}</p>
          <p>PF per week average: {selectedTeam.PF_avg}</p>
          <p>Playoff Odds: {selectedTeam.playoff_odds}%</p>

          <Grid columns={2} stackable style={{paddingTop: 25}}>
            <Grid.Row>
              <Grid.Column>
                <Header as="h3">Playoff Seed Probabilities</Header>
                <BarChart width={400} height={300} data={formatSeedData(selectedTeam.seeds)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="seed" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="probability" fill="#8884d8" name="Probability %" />
                </BarChart>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">Record-Based Playoff Odds</Header>
                <BarChart width={400} height={300} data={formatRecordData(selectedTeam.records)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="record" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="odds" fill="#82ca9d" name="Playoff Odds %" />
                </BarChart>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header as="h3">Current Week Playoff Odds</Header>
                <PieChart width={400} height={300}>
                  <Pie
                    data={formatCurrentWeekData(selectedTeam.current_week)}
                    cx={200}
                    cy={150}
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatCurrentWeekData(selectedTeam.current_week).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      )}
    </Container>
  );
};

export default LeaguePlayoffOdds;
