import './podsPanel.scss';
import React from 'react';
import _ from 'lodash';
import Base from './base';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from './listViewHelpers';
import {parseRam, unparseRam, parseCpu, unparseCpu} from '../utils/unitHelpers';

export default class PodsPanel extends Base {
    render() {
        const {items, filter, metrics, skipNamespace, skipNodeName} = this.props;
        const colSpan = 9 + !skipNamespace + !skipNodeName;

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders includeNamespace={!skipNamespace} />
                            {!skipNodeName && <th>Node</th>}
                            <th>Status</th>
                            <th>Containers</th>
                            <th>Restarts</th>
                            <th>
                                Cpu
                                <div className='podsPanel_label'>
                                    actual vs. request
                                </div>
                            </th>
                            <th>
                                Ram
                                <div className='podsPanel_label'>
                                    actual vs. request
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {hasResults(items) ? items.map(x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    isError={x.status.phase !== 'Running'}
                                    includeNamespace={!skipNamespace}
                                    href={`#/pod/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                {!skipNodeName && <td>{x.spec.nodeName}</td>}
                                <td>{x.status.phase}</td>
                                <td>{x.spec.containers.length}</td>
                                <td>{_.sumBy(x.status.containerStatuses, 'restartCount')}</td>
                                <td><Cpu item={x} metrics={metrics} /></td>
                                <td><Ram item={x} metrics={metrics} /></td>
                            </tr>
                        )) : (
                            <NoResults items={items} filter={filter} colSpan={colSpan} />
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

function Cpu({item, metrics}) {
    if (!item || !metrics) return null;

    const {containers} = metrics[item.metadata.name] || {};
    if (!containers) return null;

    const actual = _.sumBy(containers, x => parseCpu(x.usage.cpu));
    const podContainers = item.spec.containers.filter(x => x.resources && x.resources.requests);
    const requested = _.sumBy(podContainers, x => parseCpu(x.resources.requests.cpu));

    const isWarning = requested && (actual > requested);
    const actualCpu = unparseCpu(actual);
    const requestedCpu = unparseCpu(requested);
    const percent = requested ? _.round(actual / requested * 100, 1) : 100;

    return (
        <div className={isWarning ? 'contentPanel_warn' : undefined}>
            <div>{requested ? `${percent}%` : 'N/A'}</div>
            <div className='podsPanel_label'>
                <span>{actualCpu.value}{actualCpu.unit}</span>
                <span> of </span>
                <span>{requestedCpu.value}{requestedCpu.unit}</span>
            </div>
        </div>
    );
}

function Ram({item, metrics}) {
    if (!item || !metrics) return null;

    const {containers} = metrics[item.metadata.name] || {};
    if (!containers) return null;

    const actual = _.sumBy(containers, x => parseRam(x.usage.memory));
    const requested = _.sumBy(item.spec.containers, (x) => {
        if (!x.resources.requests) return 0;
        return parseRam(x.resources.requests.memory);
    });

    const isWarning = requested && (actual > requested);
    const actualRam = unparseRam(actual);
    const requestedRam = unparseRam(requested);
    const percent = requested ? _.round(actual / requested * 100, 1) : 100;

    return (
        <div className={isWarning ? 'contentPanel_warn' : undefined}>
            <div>{requested ? `${percent}%` : 'N/A'}</div>
            <div className='podsPanel_label'>
                <span>{actualRam.value}{actualRam.unit}</span>
                <span> of </span>
                <span>{requestedRam.value}{requestedRam.unit}</span>
            </div>
        </div>
    );
}
