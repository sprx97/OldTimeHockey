import _ from 'lodash';
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';

var MAX_PICK = 253

const ADPTable = ({data, isLoaded, numLeagues}) => {
    return (
        <div>
            {!isLoaded ? (
                <Loader active size="massive" style={{ marginTop: '150px' }} />
            ) : (
            <Table definition celled compact unstackable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={1} />
                        <Table.HeaderCell
                            width={7}
                            textAlign="center"
                        >
                            Player
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            textAlign="center"
                        >
                            ADP
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            textAlign="center"
                        >
                            Min
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            textAlign="center"
                        >
                            Max
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={3}
                            textAlign="center"
                        >
                            % Drafted
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {_.map(
                    data,
                    (
                        {
                            name,
                            position,
                            picks,
                        },
                        index,
                    ) => (
                    <Table.Row className={position.replace("/", "")}>
                        <Table.Cell textAlign="center">{index + 1}</Table.Cell>
                        <Table.Cell textAlign="center">{name}</Table.Cell>
                        <Table.Cell textAlign="center">{+((picks.reduce((a, b) => a+b) + MAX_PICK*(numLeagues-picks.length)) / numLeagues).toFixed(2)}</Table.Cell>
                        <Table.Cell textAlign="center">{Math.min.apply(null, picks)}</Table.Cell>
                        <Table.Cell textAlign="center">{(picks.length === numLeagues) ? Math.max.apply(null, picks) : "--"}</Table.Cell>
                        <Table.Cell textAlign="center">{100*picks.length/numLeagues}</Table.Cell>
                    </Table.Row>
                    ),
                )}
                </Table.Body>
            </Table>
            )}
        </div>
    );
};

export default ADPTable;

