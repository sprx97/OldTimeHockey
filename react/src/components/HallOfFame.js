/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Container, Grid, Header, Segment, List } from 'semantic-ui-react';

const useFetch = url => {
  const [data, setData] = useState(null);

  async function fetchData() {
    const response = await fetch(url);
    const json = await response.json();
    setData(json.splice(0, 5));
  }

  useEffect(() => {
    fetchData();
  }, [url]);

  return data;
};

const HallOfFame = () => {
  const winsRecord = useFetch('http://www.roldtimehockey.com/node/winsrecord');
  const winsRecordList =
    winsRecord &&
    winsRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.w}
      </List.Item>
    ));

  const winPctRecord = useFetch(
    'http://www.roldtimehockey.com/node/winpctrecord',
  );
  const winPctRecordList =
    winPctRecord &&
    winPctRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wpct} ({item.w}-{item.l})
      </List.Item>
    ));

  const pfRecord = useFetch('http://www.roldtimehockey.com/node/pfrecord');
  const pfRecordList =
    pfRecord &&
    pfRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.PF}
      </List.Item>
    ));

  const avgPfRecord = useFetch(
    'http://www.roldtimehockey.com/node/avgpfrecord',
  );
  const avgPfRecordList =
    avgPfRecord &&
    avgPfRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.avg}
      </List.Item>
    ));

  const coachRatingRecord = useFetch(
    'http://www.roldtimehockey.com/node/coachratingrecord',
  );
  const coachRatingRecordList =
    coachRatingRecord &&
    coachRatingRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.careerCR}% ({item.total} GP)
      </List.Item>
    ));

  const seasonWinPctRecord = useFetch(
    'http://www.roldtimehockey.com/node/seasonwinpctrecord',
  );
  const seasonWinPctRecordList =
    seasonWinPctRecord &&
    seasonWinPctRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wpct.toFixed(3)} ({item.wins}-{item.losses}) (
        {item.year}-{item.year + 1} {item.name})
      </List.Item>
    ));

  const seasonWinsRecord = useFetch(
    'http://www.roldtimehockey.com/node/seasonwinsrecord',
  );
  const seasonWinsRecordList =
    seasonWinsRecord &&
    seasonWinsRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wins} ({item.year}-{item.year + 1} {item.name})
      </List.Item>
    ));

  const seasonPfRecord = useFetch(
    'http://www.roldtimehockey.com/node/seasonwinsrecord',
  );
  const seasonPfRecordList =
    seasonPfRecord &&
    seasonPfRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.pointsFor} ({item.year}-{item.year + 1}{' '}
        {item.name})
      </List.Item>
    ));

  const seasonCoachRatingRecord = useFetch(
    'http://www.roldtimehockey.com/node/seasoncoachratingrecord',
  );
  const seasonCoachRatingRecordList =
    seasonCoachRatingRecord &&
    seasonCoachRatingRecord.map(item => (
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
