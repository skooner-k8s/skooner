import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseRam, TO_GB} from '../utils/unitHelpers';

export default function NodeRamChart({items, metrics}) {
    const totals = getNodeRamTotals(items, metrics);
    return (
        <div className='charts_item'>
            {totals ? (
                <Chart used={totals.used} usedSuffix='Gb' available={totals.available} availableSuffix='Gb' />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Node Ram Use</div>
            <div className='charts_itemSubLabel'>Used vs Available</div>
        </div>
    );
}

function getNodeRamTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseRam(x.usage.memory)) / TO_GB;
    const available = _.sumBy(items, x => parseRam(x.status.capacity.memory)) / TO_GB;

    return {used, available};
}
