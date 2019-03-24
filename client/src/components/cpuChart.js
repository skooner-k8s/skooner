import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';

export default function CpuTotalsChart({items, metrics}) {
    const totals = getPodCpuTotals(items, metrics);

    return (
        <div className='charts_item'>
            <Chart
                decimals={2}
                used={totals && totals.used}
                available={totals && totals.available}
            />

            <div className='charts_itemLabel'>Requested Cpu Use</div>
        </div>
    );
}

function getPodCpuTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricsContainers = Object.values(metrics).flatMap(x => x.containers);
    const podContainers = items
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests);

    const used = _.sumBy(metricsContainers, x => parseCpu(x.usage.cpu)) / TO_ONE_CPU;
    const available = _.sumBy(podContainers, x => parseCpu(x.resources.requests.cpu)) / TO_ONE_CPU;

    return {used, available};
}
