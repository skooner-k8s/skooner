import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';

export default function NodeStatusChart({items}) {
    const ready = _.filter(items, x => getReadyStatus(x) === 'True');

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={ready.length} available={items.length} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Nodes</div>
        </div>
    );
}

function getReadyStatus({status}) {
    if (!status.conditions) return null;

    const ready = status.conditions.find(y => y.type === 'Ready');
    return ready && ready.status;
}
