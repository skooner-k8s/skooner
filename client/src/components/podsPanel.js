import './podsPanel.scss';
import React from 'react';
import _ from 'lodash';
import Base from './base';
import {MetadataHeaders, MetadataColumns, TableBody} from './listViewHelpers';
import Sorter from './sorter';
import {parseRam, unparseRam, parseCpu, unparseCpu} from '../utils/unitHelpers';

export default class PodsPanel extends Base {
    render() {
        const {items, metrics, sort, filter, skipNamespace, skipNodeName} = this.props;
        const col = 8 + !skipNamespace + !skipNodeName;

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} includeNamespace={!skipNamespace} />
                            {!skipNodeName && (
                                <th><Sorter field='spec.nodeName' sort={sort}>Node</Sorter></th>
                            )}
                            <th><Sorter field='status.phase' sort={sort}>Status</Sorter></th>
                            <th><Sorter field={getContainerCount} sort={sort}>Containers</Sorter></th>
                            <th><Sorter field={getRestartCount} sort={sort}>Restarts</Sorter></th>

                            {/* TODO: support sorting by metrics */}
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

                    <TableBody items={items} filter={filter} sort={sort} colSpan={col} row={x => (
                        <tr key={x.metadata.uid}>
                            <MetadataColumns
                                item={x}
                                isError={x.status.phase !== 'Running'}
                                includeNamespace={!skipNamespace}
                                href={`#/pod/${x.metadata.namespace}/${x.metadata.name}`}
                            />
                            {!skipNodeName && <td>{x.spec.nodeName}</td>}
                            <td>{x.status.phase}</td>
                            <td>{getContainerCount(x)}</td>
                            <td>{getRestartCount(x)}</td>
                            <td><Cpu item={x} metrics={metrics} /></td>
                            <td><Ram item={x} metrics={metrics} /></td>
                        </tr>
                    )} />
                </table>
            </div>
        );
    }
}

function getContainerCount({spec}) {
    return spec.containers ? spec.containers.length : 0;
}

function getRestartCount({status}) {
    return _.sumBy(status.containerStatuses, 'restartCount');
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
