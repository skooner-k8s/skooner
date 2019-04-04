import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import Chart from '../components/chart';
import NodeStatusChart from '../components/nodeStatusChart';
import LoadingChart from '../components/loadingChart';
import {MetadataHeaders, MetadataColumns, TableBody, objectMap} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo} from '../components/sorter';
import api from '../services/api';
import {parseCpu, parseRam, TO_GB, TO_ONE_CPU} from '../utils/unitHelpers';
import test from '../utils/filterHelper';

export default class Nodes extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    componentDidMount() {
        this.registerApi({
            items: api.node.list(items => this.setState({items})),
            metrics: api.metrics.nodes(metrics => this.setState({metrics})),
        });
    }

    render() {
        const {items, metrics, sort, filter} = this.state;

        const filtered = items && items.filter((x) => {
            const labels = x.metadata.labels || {};
            const searchableLabels = Object.entries(labels).flat();
            return test(filter, x.metadata.name, ...searchableLabels);
        });

        const filteredMetrics = getNodeMetrics(filtered, metrics);

        return (
            <div id='content'>
                <Filter
                    text='Nodes'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='charts'>
                    <NodeStatusChart items={filtered} />
                    <CpuTotalsChart items={filtered} metrics={filteredMetrics} />
                    <RamTotalsChart items={filtered} metrics={filteredMetrics} />
                </div>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders sort={sort} />
                                <th>Labels</th>
                                <th><Sorter field={getReadyStatus} sort={sort}>Ready</Sorter></th>
                                <th>Cpu</th>
                                <th>Ram</th>
                                {/* <th><Sorter field={sortByCpu} sort={sort}>Cpu</Sorter></th>
                                <th><Sorter field={sortByRam} sort={sort}>Ram</Sorter></th> */}
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan='8' row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns item={x} href={`#/node/${x.metadata.name}`} />
                                <td>{objectMap(x.metadata.labels)}</td>
                                <td>{getReadyStatus(x)}</td>
                                <td><CpuChart item={x} metrics={filteredMetrics} /></td>
                                <td><RamChart item={x} metrics={filteredMetrics} /></td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

// TODO: get sortying by cpu/ram working
// function sortByCpu(item) {
//     const used = getCpuUsed(item, filteredMetrics);
//     if (used == null) return null;

//     const available = getCpuAvailable(item);
//     return used / available;
// }

// function sortByRam(item) {
//     const used = getRamUsed(item, filteredMetrics);
//     if (used == null) return null;

//     const available = getRamAvailable(item);
//     return used / available;
// }

function getReadyStatus({status}) {
    if (!status.conditions) return null;

    const ready = status.conditions.find(y => y.type === 'Ready');
    return ready && ready.status;
}

function CpuTotalsChart({items, metrics}) {
    const totals = getNodeCpuTotals(items, metrics);
    return (
        <div className='charts_item'>
            {totals ? (
                <Chart used={totals.used} available={totals.available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Cpu Cores Used</div>
        </div>
    );
}

function RamTotalsChart({items, metrics}) {
    const totals = getNodeRamTotals(items, metrics);
    return (
        <div className='charts_item'>
            {totals ? (
                <Chart used={totals.used} available={totals.available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>GB Ram Used</div>
        </div>
    );
}

function CpuChart({item, metrics}) {
    const used = getCpuUsed(item, metrics);
    if (used == null) return null;

    const available = getCpuAvailable(item);
    return <Percent used={used} available={available} />;
}

function getCpuUsed(item, metrics) {
    const usage = getUsage(item, metrics);
    if (!usage) return null;

    return parseCpu(usage.cpu) / 1000000;
}

function getCpuAvailable(item) {
    return parseCpu(item.status.capacity.cpu) / 1000000;
}

function RamChart({item, metrics}) {
    const used = getRamUsed(item, metrics);
    if (used == null) return null;

    const available = getRamAvailable(item);
    return <Percent used={used} available={available} />;
}

function getRamUsed(item, metrics) {
    const usage = getUsage(item, metrics);
    if (!usage) return null;

    return parseRam(usage.memory);
}

function getRamAvailable(item) {
    return parseRam(item.status.capacity.memory);
}

function Percent({used, available}) {
    const percent = _.round(used / available * 100, 1);
    return (<span>{`${percent}%`}</span>);
}

function getUsage(item, metrics) {
    if (!item || !metrics) return null;
    const result = metrics[item.metadata.name] || {};
    return result && result.usage;
}

function getNodeMetrics(nodes, metrics) {
    if (!nodes || !metrics) return null;

    const names = _.map(nodes, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}

function getNodeCpuTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseCpu(x.usage.cpu)) / TO_ONE_CPU;
    const available = _.sumBy(items, x => parseCpu(x.status.capacity.cpu)) / TO_ONE_CPU;

    return {used, available};
}

function getNodeRamTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseRam(x.usage.memory)) / TO_GB;
    const available = _.sumBy(items, x => parseRam(x.status.capacity.memory)) / TO_GB;

    return {used, available};
}
