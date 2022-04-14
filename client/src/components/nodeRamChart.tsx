import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseRam, parseUnitsOfRam} from '../utils/unitHelpers';
import {Node, Metrics} from '../utils/types';

export default function NodeRamChart({items, metrics}: {items?: Node[], metrics?: _.Dictionary<Metrics>}) {
    const totals = getNodeRamTotals(items, metrics);
    const available = parseUnitsOfRam(totals && totals.available);
    const used = parseUnitsOfRam(totals && totals.used, available && available.unit);
    const decimals = used && used.value > 10 ? 1 : 2;

    return (
        <div className='charts_item'>
            {totals ? (
                <Chart
                    decimals={decimals}
                    used={used && used.value}
                    usedSuffix={used && used.unit}
                    available={available && available.value}
                    availableSuffix={available && available.unit}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Node Ram Use</div>
            <div className='charts_itemSubLabel'>Used vs Available</div>
        </div>
    );
}

function getNodeRamTotals(items?: Node[], metrics?: _.Dictionary<Metrics>) {
    if (!items || !metrics) return undefined;

    const metricValues = Object.values(metrics) || [];

    const used = _.sumBy(metricValues, x => parseRam(_.get(x, 'usage.memory')));
    const available = _.sumBy(items, x => parseRam(_.get(x, 'status.capacity.memory')));
    return {used, available};
}
