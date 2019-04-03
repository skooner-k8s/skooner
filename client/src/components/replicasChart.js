import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';

export default function ReplicasChart({item}) {
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
