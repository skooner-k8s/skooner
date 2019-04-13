import React from 'react';
import moment from 'moment';
import {TableBody} from './listViewHelpers';
import log from '../utils/log';
import ResourceSvg from '../art/resourceSvg';
import Sorter, {sortByDate} from './sorter';

export default function EventsPanel({items, filter, shortList, sort}) {
    return (
        <div className='contentPanel'>
            <table className='wrapped'>
                <thead>
                    <tr>
                        <th className='th_icon optional_medium'>
                            <Sorter field='involvedObject.kind' sort={sort}>Type</Sorter>
                        </th>
                        {!shortList && (
                            <th>
                                <Sorter field={sortByName} sort={sort}>Name</Sorter>
                            </th>
                        )}
                        <th>
                            <Sorter field={sortByDate} sort={sort}>Time</Sorter>
                        </th>
                        <th className='optional_small'>
                            <Sorter field='reason' sort={sort}>Reason</Sorter>
                        </th>
                        <th>
                            <Sorter field='message' sort={sort}>Event</Sorter>
                        </th>
                    </tr>
                </thead>

                <TableBody
                    items={items}
                    filter={filter}
                    colSpan={shortList ? 4 : 5}
                    sort={sort}
                    row={x => (
                        <tr key={x.metadata.name}>
                            <td className='td_icon optional_medium'>
                                <ResourceSvg
                                    resource={x.involvedObject.kind}
                                    className={getTypeClass(x.type)}
                                />
                                <div className='td_iconLabel'>{x.involvedObject.kind}</div>
                            </td>
                            {!shortList && (
                                <td>{x.involvedObject.namespace}:{x.involvedObject.name}</td>
                            )}
                            <td>{moment(x.metadata.creationTimestamp).fromNow(true)}</td>
                            <td className='optional_small'>{x.reason}</td>
                            <td>{x.message}</td>
                        </tr>
                    )}
                />
            </table>
        </div>
    );
}

function sortByName({involvedObject}) {
    return `${involvedObject.namespace}:${involvedObject.name}`;
}

function getTypeClass(type) {
    switch (type) {
        case 'Normal':
            return '';

        case 'Warning':
        case 'Error':
            return 'svg_error';

        default: {
            const error = new Error('Unexpected event type');
            log.error('Unexpected event type', {error, type});
            return '';
        }
    }
}
