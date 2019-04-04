import './podsPanel.scss';
import React from 'react';
import _ from 'lodash';
import Base from './base';
import {MetadataHeaders, MetadataColumns, TableBody} from './listViewHelpers';
import Sorter from './sorter';
import {parseRam, unparseRam, parseCpu, unparseCpu} from '../utils/unitHelpers';

export default class PodsPanel extends Base {
    constructor(props) {
        super(props);
        this.sortByCpu = this.sortByCpu.bind(this);
        this.sortByRam = this.sortByRam.bind(this);
    }

    sortByCpu(item) {
        const actual = getCpuUsage(item, this.props.metrics);
        const requested = getCpuRequest(item);
        return actual / requested;
    }

    sortByRam(item) {
        const actual = getRamUsage(item, this.props.metrics);
        const requested = getRamRequest(item);
        return actual / requested;
    }

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
                            <th>
                                <Sorter field={this.sortByCpu} sort={sort}>
                                    Cpu
                                    <div className='podsPanel_label'>
                                        actual vs. request
                                    </div>
                                </Sorter>
                            </th>
                            <th>
                                <Sorter field={this.sortByRam} sort={sort}>
                                    Ram
                                    <div className='podsPanel_label'>
                                        actual vs. request
                                    </div>
                                </Sorter>
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
    const containers = getContainerMetrics(item, metrics);
    if (!containers) return null;

    const actual = getCpuUsage(item, metrics);
    const requested = getCpuRequest(item);
    return <Chart actual={actual} requested={requested} unparser={unparseCpu} />;
}

function getCpuUsage(item, metrics) {
    const containers = getContainerMetrics(item, metrics);
    return _.sumBy(containers, x => parseCpu(x.usage.cpu));
}

function getCpuRequest(item) {
    const podContainers = _.filter(item.spec.containers, x => x.resources && x.resources.requests);
    return _.sumBy(podContainers, x => parseCpu(x.resources.requests.cpu));
}

function Ram({item, metrics}) {
    const containers = getContainerMetrics(item, metrics);
    if (!containers) return null;

    const actual = getRamUsage(item, metrics);
    const requested = getRamRequest(item);
    return <Chart actual={actual} requested={requested} unparser={unparseRam} />;
}

function Chart({actual, requested, unparser}) {
    const isWarning = requested && (actual > requested);
    const actualRam = unparser(actual);
    const requestedRam = unparser(requested);
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

function getRamUsage(item, metrics) {
    const containers = getContainerMetrics(item, metrics);
    return _.sumBy(containers, x => parseRam(x.usage.memory));
}

function getRamRequest(item) {
    return _.sumBy(item.spec.containers, (x) => {
        if (!x.resources.requests) return 0;
        return parseRam(x.resources.requests.memory);
    });
}

function getContainerMetrics(item, metrics) {
    if (!item || !metrics) return null;
    const metric = metrics[item.metadata.name] || {};
    return metric.containers;
}
