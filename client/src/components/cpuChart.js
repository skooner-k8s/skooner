import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';

export default function CpuChart({items, metrics}) {
    const totals = getPodCpuTotals(items, metrics);

    return (
        <div className='charts_item'>
            {totals ? (
                <Chart decimals={2} used={totals.used} available={totals.available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Requested Cpu Use</div>
        </div>
    );
}

function getPodCpuTotals(items, metrics) {
    if (!items || !metrics) return null;

    const used = _(metrics)
        .flatMap(x => x.containers)
        .sumBy(x => parseCpu(x.usage.cpu));

    const available = _(items)
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests)
        .sumBy(x => parseCpu(x.resources.requests.cpu));

    return {
        used: used / TO_ONE_CPU,
        available: available / TO_ONE_CPU,
    };
}
