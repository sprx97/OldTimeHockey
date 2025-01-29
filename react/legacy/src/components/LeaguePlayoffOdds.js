import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Header, Grid, Dropdown } from 'semantic-ui-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
        {typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A'}
      </div>
    );
  }
  return null;
};

const LeaguePlayoffOdds = (props) => {
  const leagueId = props.match.params.leagueId;
  const location = useLocation();
  const leagueName = location.state?.leagueName || 'League';
  const [playoffOdds, setPlayoffOdds] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const COLORS = ['#99D9D9', '#355464', '#001628', '#E9072B', '#99D9D9', '#355464'];

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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatSeedData(selectedTeam.seeds)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="seed" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="probability" fill="#99D9D9" name="Probability %" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">Record-Based Playoff Odds</Header>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatRecordData(selectedTeam.records)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="record" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="odds" fill="#355464" name="Playoff Odds %" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header as="h3">Current Week Impact on Playoff Odds</Header>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="category"
                    dataKey="scenario" 
                    allowDuplicatedCategory={false}
                  />
                  <YAxis 
                    type="number"
                    dataKey="odds"
                    domain={[0, 100]} 
                    ticks={[0, 20, 40, 60, 80, 100]}
                    label={{ value: 'Playoff Odds %', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis range={[400, 400]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter 
                    name="Current" 
                    data={[{
                      scenario: 'Current',
                      odds: selectedTeam.playoff_odds || 0
                    }]} 
                    fill="#99D9D9"
                    shape="circle" 
                    legendType="circle"
                  />
                  <Scatter 
                    name="Win" 
                    data={[{
                      scenario: 'If Win',
                      odds: selectedTeam.current_week?.win?.odds || 0
                    }]} 
                    fill="#355464"
                    shape="circle"
                    legendType="circle"
                  />
                  <Scatter 
                    name="Loss" 
                    data={[{
                      scenario: 'If Loss',
                      odds: selectedTeam.current_week?.loss?.odds || 0
                    }]} 
                    fill="#E9072B"
                    shape="circle"
                    legendType="circle"
                  />
                  </ScatterChart>
                </ResponsiveContainer>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      )}
    </Container>
  );
};

export default LeaguePlayoffOdds;
