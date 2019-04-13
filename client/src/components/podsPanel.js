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
        const requested = getCpuRequest(item, this.props.metrics);
        return actual / requested;
    }

    sortByRam(item) {
        const actual = getRamUsage(item, this.props.metrics, null);
        const requested = getRamRequest(item, this.props.metrics);
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
                                href={`#!pod/${x.metadata.namespace}/${x.metadata.name}`}
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
    const requested = getCpuRequest(item, metrics);
    const defined = getCpuRequestFlag(item);
    return <Chart actual={actual} requested={requested} unparser={unparseCpu} defined={defined} />;
}

function getCpuUsage(item, metrics, name) {
    const containers = getContainerMetrics(item, metrics);
    return _.sumBy(containers, (x) => {
        if (name && x.name !== name) {
            return 0;
        }
        return parseCpu(x.usage.cpu);
    });
}

function getCpuRequest(item, metrics) {
    return _.sumBy(item.spec.containers, (x) => {
        if (!x.resources.requests || !x.resources.requests.cpu) return getCpuUsage(item, metrics, x.name);
        return parseCpu(x.resources.requests.cpu);
    });
}

function getCpuRequestFlag(item) {
    return !_.some(item.spec.containers, x => !x.resources.requests || !x.resources.requests.cpu);
}

function Ram({item, metrics}) {
    const containers = getContainerMetrics(item, metrics);
    if (!containers) return null;

    const actual = getRamUsage(item, metrics, null);
    const requested = getRamRequest(item, metrics);
    const defined = getRamRequestFlag(item);
    return <Chart actual={actual} requested={requested} unparser={unparseRam} defined={defined} />;
}

function Chart({actual, requested, unparser, defined}) {
    const isWarning = requested && (actual > requested);
    const actualRam = unparser(actual);
    const requestedRam = unparser(requested);
    const percent = requested ? _.round(actual / requested * 100, 1) : 100;

    return (
        <div className={isWarning ? 'contentPanel_warn' : undefined}>
            <div>{requested ? `${percent}%` : 'N/A'}</div>
            <div className='podsPanel_label'>
                <span>{actualRam.value}{actualRam.unit}</span>
                {defined && <span> of </span>}
                {defined && <span>{requestedRam.value}{requestedRam.unit}</span>}
            </div>
        </div>
    );
}

function getRamUsage(item, metrics, name) {
    const containers = getContainerMetrics(item, metrics);
    return _.sumBy(containers, (x) => {
        if (name && x.name !== name) {
            return 0;
        }
        return parseRam(x.usage.memory);
    });
}

function getRamRequest(item, metrics) {
    return _.sumBy(item.spec.containers, (x) => {
        if (!x.resources.requests || !x.resources.requests.memory) return getRamUsage(item, metrics, x.name);
        return parseRam(x.resources.requests.memory);
    });
}

function getRamRequestFlag(item) {
    return !_.some(item.spec.containers, x => !x.resources.requests || !x.resources.requests.memory);
}

function getContainerMetrics(item, metrics) {
    if (!item || !metrics) return null;
    const metric = metrics[item.metadata.name] || {};
    return metric.containers;
}
