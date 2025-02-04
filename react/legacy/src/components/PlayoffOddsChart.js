import React from 'react';
import { Modal, Segment, Header } from 'semantic-ui-react';
import {
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, 
} from 'recharts';
import _ from 'lodash';

const PlayoffOddsChart = ({ isOpen, onClose, data, leagueName }) => {
  const chartData = (data || [])
    .map(teamData => ({
      name: teamData.name || '',
      wins: parseInt(teamData.wins || 0),
      playoffOdds: parseFloat(teamData.playoff_odds || 0),
      byeOdds: parseFloat(teamData.bye_odds || 0),
      doubleDemotionOdds: teamData.d3_odds ? parseFloat(teamData.d3_odds) : undefined,
      seeds: teamData.seeds || []
    }))
    .sort((a, b) => (b.playoffOdds || 0) - (a.playoffOdds || 0));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Segment>
          <p><strong>{label}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {parseFloat(entry.value).toFixed(1)}%
            </p>
          ))}
        </Segment>
      );
    }
    return null;
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="fullscreen">
      <Modal.Header>Playoff Odds Dashboard - {leagueName}</Modal.Header>
      <Modal.Content>
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Playoff Odds Chart */}
          <Segment>
            <Header as="h3">Playoff & Bye Week Odds</Header>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="playoffOdds" name="Playoff%" fill="#8884d8" />
                  <Bar dataKey="byeOdds" name="Bye%" fill="#82ca9d" />
                  {chartData[0]?.doubleDemotionOdds !== undefined && (
                    <Bar dataKey="doubleDemotionOdds" name="D3%" fill="#ffc658" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Segment>

          {/* Wins vs Playoff Odds Scatter Plot */}
          <Segment>
            <Header as="h3">Wins vs Playoff Odds Correlation</Header>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="wins" 
                    name="Wins"
                    label={{ value: 'Wins', position: 'bottom' }}
                  />
                  <YAxis 
                    dataKey="playoffOdds" 
                    name="Playoff Odds"
                    label={{ value: 'Playoff Odds (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="Teams"
                    data={chartData}
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Segment>

          {/* Seed Distribution Chart for First Place Team */}
          {chartData.length > 0 && chartData[0].seeds && (
            <Segment>
              <Header as="h3">Seed Distribution - {chartData[0].name}</Header>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart 
                    data={chartData[0].seeds.map((prob, idx) => ({
                      seed: `Seed ${idx + 1}`,
                      probability: parseFloat(prob * 100).toFixed(1)
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="seed" />
                    <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="probability" fill="#82ca9d" name="Probability" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Segment>
          )}
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default PlayoffOddsChart;
