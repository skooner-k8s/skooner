import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import ChartsContainer from '../components/chartsContainer';
import Filter from '../components/filter';
import {defaultSortInfo} from '../components/sorter';
import NodeStatusChart from '../components/nodeStatusChart';
import api from '../services/api';
import test from '../utils/filterHelper';
import NodesPanel from '../components/nodesPanel';
import Chart from '../components/chart';
import LoadingChart from '../components/loadingChart';
import {parseCpu, parseRam, TO_GB, TO_ONE_CPU} from '../utils/unitHelpers';

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

                <ChartsContainer>
                    <NodeStatusChart items={filtered} />
                    <CpuTotalsChart items={filtered} metrics={filteredMetrics} />
                    <RamTotalsChart items={filtered} metrics={filteredMetrics} />
                </ChartsContainer>

                <NodesPanel
                    sort={sort}
                    items={filtered}
                    metrics={filteredMetrics}
                />
            </div>
        );
    }
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
            <div className='charts_itemLabel'>Cores</div>
            <div className='charts_itemSubLabel'>Used vs Available</div>
        </div>
    );
}

function RamTotalsChart({items, metrics}) {
    const totals = getNodeRamTotals(items, metrics);
    return (
        <div className='charts_item'>
            {totals ? (
                <Chart used={totals.used} usedSuffix='Gb' available={totals.available} availableSuffix='Gb' />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Ram</div>
            <div className='charts_itemSubLabel'>Used vs Available</div>
        </div>
    );
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
