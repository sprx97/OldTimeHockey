import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Header, Grid, Dropdown } from 'semantic-ui-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, LineChart } from 'recharts';

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

  const fetchPlayoffOdds = async () => {
    try {
      const response = await fetch(`https://roldtimehockey.com/node/v2/standings/advanced/playoff_odds?league=${leagueId}`);
      const data = await response.json();

      console.log('data', data)
      setPlayoffOdds(data);
      // Set the first team as selected by default
      if (data && Object.keys(data).length > 0) {
        setSelectedTeam(Object.values(data)[0]);
      }
    } catch (error) {
      console.error('Error fetching playoff odds:', error);
    }
  };

  const [playoffOdds, setPlayoffOdds] = useState(() => {
    // Start the fetch when component mounts
    fetchPlayoffOdds();
    return null;
  });
  const [selectedTeam, setSelectedTeam] = useState(null);

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
      text: `${team.name} (${team.owner})`,
      value: team.name
    }));
  };

  const handleTeamChange = (_, data) => {
    const team = Object.values(playoffOdds).find(t => t.name === data.value);
    setSelectedTeam(team);
  };

  return (
    <Container style={{ marginTop: '2rem', padding: '0 1rem' }}>
      <Header as="h1">{leagueName} - Playoff Odds</Header>
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
       
        <>
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
                <Header as="h3">Playoff Seed Probabilities</Header>
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
                  <Legend verticalAlign="top" height={36} align="right" />
                  <Bar dataKey="probability" fill="#99D9D9" name="Probability %" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">Record-Based Playoff Odds</Header>
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
                  <Legend verticalAlign="top" height={36} align="right" />
                  <Bar dataKey="odds" fill="#355464" name="Playoff Odds %" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header as="h3">Current Week Impact on Playoff Odds</Header>
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
                    <Legend verticalAlign="top" height={36} />
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
     </>
      )}
    </Container>
  );
};

export default LeaguePlayoffOdds;
