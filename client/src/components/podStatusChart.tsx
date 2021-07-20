import React from 'react';
import LoadingChart from './loadingChart';
import {Pod} from '../utils/types';
import PrometheusGraph from '../views/prometheusgraph';

export default function PodStatusChart({items}: {items?: Pod[]}) {
    const available = items && items.length;
    const query = {
        queryString: 'sum(kube_pod_info)',
        title: 'Pod Count',
        yAxisMin: 0,
        yAxisUnit: 'Pods',
    };
    return (
        <div className='charts_item'>
            {items && available ? (
                <PrometheusGraph
                    queryString={query.queryString}
                    title={query.title}
                    yAxisMin={query.yAxisMin}
                    yAxisUnit={query.yAxisUnit}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Pods</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}
