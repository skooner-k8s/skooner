import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';
import {Node, Metrics} from '../utils/types';

export default function NodeCpuChart({items, metrics}: {items?: Node[], metrics?: _.Dictionary<Metrics>}) {
    const totals = getNodeCpuTotals(items, metrics);

    return (
        <div className='charts_item'>
            {totals ? (
                <Chart used={totals.used} available={totals.available} />
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

    const metricValues = Object.values(metrics) || [];

    const used = _.sumBy(metricValues, x => parseCpu(_.get(x, 'usage.cpu'))) / TO_ONE_CPU;
    const available = _.sumBy(items, x => parseCpu(_.get(x, 'status.capacity.cpu'))) / TO_ONE_CPU;
    return {used, available};
}
