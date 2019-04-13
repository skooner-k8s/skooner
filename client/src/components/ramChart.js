import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseRam, TO_GB} from '../utils/unitHelpers';

export default function RamChart({items, metrics}) {
    const totals = getPodRamTotals(items, metrics);
    const decimals = totals && totals.used > 10 ? 1 : 2;

    return (
        <div className='charts_item'>
            {totals ? (
                <Chart
                    decimals={decimals}
                    used={totals && totals.used}
                    usedSuffix='Gb'
                    available={totals && totals.available}
                    availableSuffix='Gb'
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Ram Used</div>
        </div>
    );
}

export function getPodRamTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricsContainers = Object.values(metrics)
        .flatMap(x => x.containers);

    const metricsContainersWithoutRequests = Object.values(metrics)
        .flatMap(x => x.containers)
        .filter(x => !x.resources || !x.resources.requests || !x.resource.requests.memory);

    const podContainers = items
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests && x.resources.requests.memory);

    const used = _.sumBy(metricsContainers, x => parseRam(x.usage.memory)) / TO_GB;

    let available = _.sumBy(metricsContainersWithoutRequests, x => parseRam(x.usage.memory));

    available += _.sumBy(podContainers, x => parseRam(x.resources.requests.memory));
    available /= TO_GB;

    return {used, available};
}
