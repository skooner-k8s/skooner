import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import Chart from '../components/chart';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults, objectMap} from '../components/listViewHelpers';
import api from '../services/api';
import {parseCpu, parseRam} from '../utils/unitHelpers';
import test from '../utils/filterHelper';
import {getNodeMetrics, getNodeCpuTotals, getNodeRamTotals} from '../utils/metricsHelpers';

export default class Nodes extends Base {
    componentDidMount() {
        this.registerApi({
            items: api.node.list(items => this.setState({items})),
            metrics: api.metrics.nodes(metrics => this.setState({metrics})),
        });
    }

    render() {
        const {items, metrics, filter = ''} = this.state || {};

        const filtered = items && _.orderBy(items, 'metadata.name')
            .filter((x) => {
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
                    <div className='charts_item'>
                        <div>{filtered && filtered.length}</div>
                        <div className='charts_itemLabel'>Nodes</div>
                    </div>
                    <div className='charts_item'>
                        <CpuTotalsChart items={filtered} metrics={filteredMetrics} />
                        <div className='charts_itemLabel'>Cpu Cores Used</div>
                    </div>
                    <div className='charts_item'>
                        <RamTotalsChart items={filtered} metrics={filteredMetrics} />
                        <div className='charts_itemLabel'>GB Ram Used</div>
                    </div>
                </div>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders />
                                <th>Labels</th>
                                <th>Ready</th>
                                <th>Cpu</th>
                                <th>Ram</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        href={`#/node/${x.metadata.name}`}
                                    />
                                    <td>
                                        {objectMap(x.metadata.labels)}
                                    </td>
                                    <td>
                                        {x.status.conditions && (x.status.conditions.find(y => y.type === 'Ready') || {}).status}
                                    </td>
                                    <td>
                                        <CpuChart item={x} metrics={filteredMetrics} />
                                    </td>
                                    <td>
                                        <RamChart item={x} metrics={filteredMetrics} />
                                    </td>
                                </tr>
                            )) : (
                                <NoResults items={filtered} filter={filter} colSpan='8' />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

function CpuTotalsChart({items, metrics}) {
    const totals = getNodeCpuTotals(items, metrics);
    return totals && (
        <Chart used={totals.used} available={totals.available} />
    );
}

function RamTotalsChart({items, metrics}) {
    const totals = getNodeRamTotals(items, metrics);
    return totals && (
        <Chart used={totals.used} available={totals.available} />
    );
}

function CpuChart({item, metrics}) {
    if (!item || !metrics) return null;

    const {usage} = metrics[item.metadata.name] || {};
    if (!usage) return null;

    const totalUsed = parseCpu(usage.cpu) / 1000000;
    const totalAvailable = parseCpu(item.status.capacity.cpu) / 1000000;
    const percent = _.round(totalUsed / totalAvailable * 100, 1);

    return (<span>{`${percent}%`}</span>);
}

function RamChart({item, metrics}) {
    if (!item || !metrics) return null;

    const {usage} = metrics[item.metadata.name] || {};
    if (!usage) return null;

    const totalUsed = parseRam(usage.memory);
    const totalAvailable = parseRam(item.status.capacity.memory);
    const percent = _.round(totalUsed / totalAvailable * 100, 1);

    return (<span>{`${percent}%`}</span>);
}
