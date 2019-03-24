import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import {parseRam, TO_GB} from '../utils/unitHelpers';

export default function RamChart({items, metrics}) {
    const totals = getPodRamTotals(items, metrics);

    return (
        <div className='charts_item'>
            <Chart used={totals && totals.used} available={totals && totals.available} />
            <div className='charts_itemLabel'>Requested Ram Use</div>
        </div>
    );
}

export function getPodRamTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricsContainers = Object.values(metrics).flatMap(x => x.containers);
    const podContainers = items
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests);

    const used = _.sumBy(metricsContainers, x => parseRam(x.usage.memory)) / TO_GB;
    const available = _.sumBy(podContainers, x => parseRam(x.resources.requests.memory)) / TO_GB;

    return {used, available};
}
