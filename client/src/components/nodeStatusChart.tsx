import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {TODO} from "../utils/types";

export default function NodeStatusChart({items}: {items: TODO[]}) {
    const readyCount = _.sumBy(items, x => getReadyStatus(x) === 'True' ? 1 : 0); // eslint-disable-line no-confusing-arrow

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={readyCount} available={items.length} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Nodes</div>
            <div className='charts_itemSubLabel'>Ready vs All</div>
        </div>
    );
}

function getReadyStatus({status}: {status?: TODO}) {
    if (!status.conditions) return null;

    const ready = status.conditions.find((y: TODO) => y.type === 'Ready');
    return ready && ready.status;
}
