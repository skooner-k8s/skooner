import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';
import {TODO} from "../utils/types";

export default function NodeCpuChart({items, metrics}: {items: TODO[], metrics: TODO[]}) {
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

function getNodeCpuTotals(items: TODO[], metrics: TODO[]) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseCpu(x.usage.cpu)) / TO_ONE_CPU;
    const available = _.sumBy(items, x => parseCpu(x.status.capacity.cpu)) / TO_ONE_CPU;

    return {used, available};
}
