import React from 'react';
import LoadingChart from './loadingChart';
import {Node} from '../utils/types';
import PrometheusGraph from '../views/prometheusgraph';

export default function NodeStatusChart({items}: {items?: Node[]}) {
    const query = {
        queryString: 'sum(kube_node_info)',
        title: 'Node Count',
        yAxisMin: 0,
        yAxisUnit: 'Nodes',
    };
    return (
        <div className='charts_item'>
            {items ? (
                <PrometheusGraph
                    queryString={query.queryString}
                    title={query.title}
                    yAxisMin={query.yAxisMin}
                    yAxisUnit={query.yAxisUnit}
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Nodes</div>
            <div className='charts_itemSubLabel'>Ready vs All</div>
        </div>
    );
}
