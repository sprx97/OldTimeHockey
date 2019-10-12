/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Container, Grid, Header, Segment, List } from 'semantic-ui-react';
import { useFetch } from '../hooks/useFetch';

const HallOfFame = () => {
  const [winsRecord, winsRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/winsrecord',
  );

  const [winPctRecord, winPctRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/winpctrecord',
  );

  const [pfRecord, pfRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/pfrecord',
  );

  const [avgPfRecord, avgPfRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/avgpfrecord',
  );

  const [coachRatingRecord, coachRatingRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/coachratingrecord',
  );

  const [seasonWinPctRecord, seasonWinPctRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/seasonwinpctrecord',
  );

  const [seasonWinsRecord, seasonWinsRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/seasonwinsrecord',
  );

  const [seasonPfRecord, seasonPfRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/seasonwinsrecord',
  );

  const [seasonCoachRatingRecord, seasonCoachRatingRecordLoading] = useFetch(
    'http://www.roldtimehockey.com/node/seasoncoachratingrecord',
  );

  const winsRecordList =
    winsRecord &&
    winsRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.w}
      </List.Item>
    ));

  const winPctRecordList =
    winPctRecord &&
    winPctRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wpct} ({item.w}-{item.l})
      </List.Item>
    ));

  const pfRecordList =
    pfRecord &&
    pfRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.PF}
      </List.Item>
    ));

  const avgPfRecordList =
    avgPfRecord &&
    avgPfRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.avg}
      </List.Item>
    ));

  const coachRatingRecordList =
    coachRatingRecord &&
    coachRatingRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.careerCR}% ({item.total} GP)
      </List.Item>
    ));

  const seasonWinPctRecordList =
    seasonWinPctRecord &&
    seasonWinPctRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wpct.toFixed(3)} ({item.wins}-{item.losses}) (
        {item.year}-{item.year + 1} {item.name})
      </List.Item>
    ));

  const seasonWinsRecordList =
    seasonWinsRecord &&
    seasonWinsRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wins} ({item.year}-{item.year + 1} {item.name})
      </List.Item>
    ));

  const seasonPfRecordList =
    seasonPfRecord &&
    seasonPfRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.pointsFor} ({item.year}-{item.year + 1}{' '}
        {item.name})
      </List.Item>
    ));

  const seasonCoachRatingRecordList =
    seasonCoachRatingRecord &&
    seasonCoachRatingRecord.slice(0, 5).map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.coachRating.toFixed(2)}% ({item.year}-
        {item.year + 1} {item.name})
      </List.Item>
    ));

  return (
    <Container>
      <Segment basic>
        <Header as="h1" textAlign="center" block>
          Career Regular Season Records
        </Header>
        <Grid centered>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top">
                Wins
              </Header>
              <Segment attached>
                <List ordered>{winsRecordList}</List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top">
                Winning Percentage (Min. 40 GP)
              </Header>
              <Segment attached>
                <List ordered>{winPctRecordList}</List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top">
                Points For
              </Header>
              <Segment attached>
                <List ordered>{pfRecordList}</List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top">
                Average Points For (Min. 40 GP)
              </Header>
              <Segment attached>
                <List ordered>{avgPfRecordList}</List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top">
                Coach Rating
              </Header>
              <Segment attached>
                <List ordered>{coachRatingRecordList}</List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
      <Segment basic>
        <Header as="h1" textAlign="center" block>
          Single Season Records
        </Header>
        <Grid centered>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top">
                Best Record (Win Pct.)
              </Header>
              <Segment attached>
                <List ordered>{seasonWinPctRecordList}</List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top">
                Best Record (Wins)
              </Header>
              <Segment attached>
                <List ordered>{seasonWinsRecordList}</List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top">
                Points For
              </Header>
              <Segment attached>
                <List ordered>{seasonPfRecordList}</List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top">
                Coach Rating
              </Header>
              <Segment attached>
                <List ordered>{seasonCoachRatingRecordList}</List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HallOfFame;
