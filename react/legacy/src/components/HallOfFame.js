import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { Container, Grid, Header, Segment, List, Placeholder } from 'semantic-ui-react';

const HallOfFame = () => {
  const [winsRecord, winsRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/winsrecord?limit=5',
  );

  const [winPctRecord, winPctRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/winpctrecord?limit=5',
  );

  const [pfRecord, pfRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/pfrecord?limit=5',
  );

  const [avgPfRecord, avgPfRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/avgpfrecord?limit=5',
  );

  const [coachRatingRecord, coachRatingRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/coachratingrecord?limit=5',
  );

  const [seasonWinPctRecord, seasonWinPctRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/seasonwinpctrecord?limit=5',
  );

  const [seasonWinsRecord, seasonWinsRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/seasonwinsrecord?limit=5',
  );

  const [seasonPfRecord, seasonPfRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/seasonpfrecord?limit=5',
  );

  const [seasonCoachRatingRecord, seasonCoachRatingRecordLoading] = useFetch(
    'https://roldtimehockey.com/node/seasoncoachratingrecord?limit=5',
  );

  const winsRecordList =
    winsRecord &&
    winsRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.w}
      </List.Item>
    ));

  const winPctRecordList =
    winPctRecord &&
    winPctRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wpct} ({item.w}-{item.l}{item.t > 0 ? "-"+item.t : ''})
      </List.Item>
    ));

  const pfRecordList =
    pfRecord &&
    pfRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.PF}
      </List.Item>
    ));

  const avgPfRecordList =
    avgPfRecord &&
    avgPfRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.avg}
      </List.Item>
    ));

  const coachRatingRecordList =
    coachRatingRecord &&
    coachRatingRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.careerCR}% ({item.total} GP)
      </List.Item>
    ));

  const seasonWinPctRecordList =
    seasonWinPctRecord &&
    seasonWinPctRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wpct} ({item.wins}-{item.losses}{item.ties > 0 ? "-"+item.ties : ''}) (
        {item.year}-{item.year + 1} {item.name})
      </List.Item>
    ));

  const seasonWinsRecordList =
    seasonWinsRecord &&
    seasonWinsRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.wins} ({item.year}-{item.year + 1} {item.name})
      </List.Item>
    ));

  const seasonPfRecordList =
    seasonPfRecord &&
    seasonPfRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.pointsFor} ({item.year}-{item.year + 1}{' '}
        {item.name})
      </List.Item>
    ));

  const seasonCoachRatingRecordList =
    seasonCoachRatingRecord &&
    seasonCoachRatingRecord.map(item => (
      <List.Item key={item.FFname}>
        {item.FFname} - {item.coachRating}% ({item.year}-
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
              <Header as="h2" attached="top" textAlign="center">
                Wins
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!winsRecordLoading ? (
                    winsRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Winning Percentage (Min. 40 GP)
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!winPctRecordLoading ? (
                    winPctRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Points For
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!pfRecordLoading ? (
                    pfRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Average Points For (Min. 40 GP)
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!avgPfRecordLoading ? (
                    avgPfRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Coach Rating
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!coachRatingRecordLoading ? (
                    coachRatingRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
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
              <Header as="h2" attached="top" textAlign="center">
                Wins
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!seasonWinsRecordLoading ? (
                    seasonWinsRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Best Record (Win Pct.)
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!seasonWinPctRecordLoading ? (
                    seasonWinPctRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Points For
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!seasonPfRecordLoading ? (
                    seasonPfRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Header as="h2" attached="top" textAlign="center">
                Coach Rating
              </Header>
              <Segment attached>
                <List ordered size="big">
                  {!seasonCoachRatingRecordLoading ? (
                    seasonCoachRatingRecordList
                  ) : (
                    <Placeholder>
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder>
                  )}
                </List>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
};

export default HallOfFame;
