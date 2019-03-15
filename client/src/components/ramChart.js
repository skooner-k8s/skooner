import React from 'react';
import Chart from './chart';
import {getPodRamTotals} from '../utils/metricsHelpers';

export default function RamChart({items, metrics}) {
    const totals = getPodRamTotals(items, metrics);

    return (
        <div className='charts_item'>
            <Chart used={totals && totals.used} available={totals && totals.available} />
            <div className='charts_itemLabel'>Requested Ram Use</div>
        </div>
    );
}
