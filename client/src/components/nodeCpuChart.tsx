import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';
import {Node, Metrics} from '../utils/types';
import PrometheusGraph from '../views/prometheusgraph';

export default function NodeCpuChart({items, metrics}: {items?: Node[], metrics?: _.Dictionary<Metrics>}) {
    const totals = getNodeCpuTotals(items, metrics);
    const query = {
        queryString: 'instance:node_cpu:ratio',
        title: 'Node CPU Usage',
    };

    return (
        <div className='charts_item'>
            {totals ? (
                // <Chart used={totals.used} available={totals.available} />
                <PrometheusGraph
                    queryString={query.queryString}
                    title={query.title}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Node Cpu Use</div>
            <div className='charts_itemSubLabel'>Used vs Available</div>
        </div>
    );
}

function getNodeCpuTotals(items?: Node[], metrics?: _.Dictionary<Metrics>) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseCpu(x.usage.cpu)) / TO_ONE_CPU;
    const available = _.sumBy(items, x => parseCpu(x.status.capacity.cpu)) / TO_ONE_CPU;

    return {used, available};
}
