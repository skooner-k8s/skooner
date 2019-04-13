import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';

export default function PodStatusChart({items}) {
    const available = items && items.length;
    const current = _.filter(items, x => x.status.phase === 'Running').length;

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={current} pending={available - current} available={available} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Pods</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}
