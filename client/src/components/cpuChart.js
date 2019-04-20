import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseCpu, TO_ONE_CPU} from '../utils/unitHelpers';
import {getCpuRequestFlag} from '../utils/itemHelpers';

export default function CpuChart({items, metrics}) {
    const totals = getPodCpuTotals(items, metrics);
    const decimals = totals && totals.used > 10 ? 1 : 2;
    const defined = items ? !_(items).every(x => !getCpuRequestFlag(x)) : true;

    return (
        <div className='charts_item'>
            {totals ? (
                <Chart
                    decimals={decimals}
                    used={totals.used}
                    available={totals.available}
                    defined={defined}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Pod Cpu Use</div>
            <div className='charts_itemSubLabel'>Actual vs Reserved</div>
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
        .filter(x => x.resources && x.resources.requests && x.resources.requests.cpu)
        .sumBy(x => parseCpu(x.resources.requests.cpu));

    const namesWithoutResources = _(items)
        .flatMap(x => x.spec.containers)
        .filter(x => !x.resources || !x.resources.requests || !x.resources.requests.cpu)
        .map(x => x.name);

    const availablePlus = _(metrics)
        .flatMap(x => x.containers)
        .filter(x => namesWithoutResources.includes(x.name))
        .sumBy(x => parseCpu(x.usage.cpu));

    return {
        used: used / TO_ONE_CPU,
        available: (available + availablePlus) / TO_ONE_CPU,
    };
}
