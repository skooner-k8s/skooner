import _ from 'lodash';
import React from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {Pod} from '../utils/types';
import PrometheusGraph, {BASE_HTTP_URL} from '../views/prometheusgraph';
import api from '../services/api';

export default function PodStatusChart({items}: {items?: Pod[]}) {
    const available = items && items.length;
    const count = _.sumBy(items, x => x.status.phase === 'Running' ? 1 : 0); // eslint-disable-line no-confusing-arrow

    const query = {
        queryString: 'sum(kube_pod_info)',
        title: 'Pod Count',
        yAxisMin: 0,
        yAxisUnit: 'Pods',
    };
    const prometheusConnected = api.isPrometheusConnected(BASE_HTTP_URL);
    return (
        <div className='charts_item'>
            {
                prometheusConnected ? (
                    <PrometheusGraph
                        queryString={query.queryString}
                        title={query.title}
                        yAxisMin={query.yAxisMin}
                        yAxisUnit={query.yAxisUnit}
                    />
                ) : items && available ? (
                    <Chart used={count} pending={available - count} available={available} />
                ) : (
                    <LoadingChart />
                )
            }
            <div className='charts_itemLabel'>Pods</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}
