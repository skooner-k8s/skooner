import React from 'react';
import moment from 'moment';
import {NoResults, hasResults} from './listViewHelpers';
import log from '../utils/log';
import ResourceSvg from '../art/resourceSvg';

export default function EventsPanel({items, filter, shortList}) {
    return (
        <div className='contentPanel'>
            <table>
                <thead>
                    <tr>
                        <th className='th_icon'></th>
                        <th>Time</th>
                        {!shortList && (
                            <th>Name</th>
                        )}
                        <th>Reason</th>
                        <th>Message</th>
                    </tr>
                </thead>

                <tbody>
                    {hasResults(items) ? items.map(x => (
                        <tr key={x.metadata.name}>
                            <td className='td_icon'>
                                <ResourceSvg
                                    resource={x.involvedObject.kind}
                                    className={getTypeClass(x.type)}
                                />
                                <div className='td_iconLabel'>{x.involvedObject.kind}</div>
                            </td>
                            <td>{moment(x.metadata.creationTimestamp).fromNow(true)}</td>
                            {!shortList && (
                                <td>{x.involvedObject.namespace}:{x.involvedObject.name}</td>
                            )}
                            <td>{x.reason}</td>
                            <td>{x.message}</td>
                        </tr>
                    )) : (
                        <NoResults items={items} filter={filter} colSpan={shortList ? 4 : 5} />
                    )}
                </tbody>
            </table>
        </div>
    );
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
