import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';

export default function CpuChart({items, metrics}) {
    const totals = getPodCpuTotals(items, metrics);
    const decimals = totals && totals.used > 10 ? 1 : 2;

    return (
        <div className='charts_item'>
            {totals ? (
                <Chart
                    decimals={decimals}
                    used={totals.used}
                    available={totals.available}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Cores Used</div>
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
