import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {TODO} from '../utils/types';

export default function ReplicasChart({item}: {item: TODO}) {
    return (
        <div className='charts_item'>
            {item ? (
                <Chart
                    used={item.status.readyReplicas}
                    pending={item.status.unavailableReplicas}
                    available={item.status.replicas}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Replicas</div>
        </div>
    );
}
