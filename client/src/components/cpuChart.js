import React from 'react';
import Chart from './chart';
import {getPodCpuTotals} from '../utils/metricsHelpers';

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
