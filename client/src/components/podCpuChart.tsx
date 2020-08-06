import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';
import {Pod, Metrics} from '../utils/types';

export default function PodCpuChart({items, metrics}: {items?: Pod[], metrics?: _.Dictionary<Metrics>}) {
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
            <div className='charts_itemLabel'>Pod Cpu Use</div>
            <div className='charts_itemSubLabel'>Actual vs Reserved</div>
        </div>
    );
}

function getPodCpuTotals(pods?: Pod[], metrics?: _.Dictionary<Metrics>) {
    if (!pods || !metrics) return null;

    const used = _(metrics)
        .flatMap(x => x.containers)
        .sumBy(x => parseCpu(x.usage.cpu));

    const available = _(pods)
        .flatMap(x => x.spec.containers)
        .filter(x => !!x.resources && !!x.resources.requests)
        .sumBy(x => parseCpu(x.resources?.requests?.cpu));

    return {
        used: used / TO_ONE_CPU,
        available: available / TO_ONE_CPU,
    };
}
