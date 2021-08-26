import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {Node} from '../utils/types';
import PrometheusGraph, {BASE_HTTP_URL} from '../views/prometheusgraph';
import api from '../services/api';

export default function NodeStatusChart({items}: {items?: Node[]}) {
    const readyCount = _.sumBy(items, x => getReadyStatus(x) === 'True' ? 1 : 0); // eslint-disable-line no-confusing-arrow

    const query = {
        queryString: 'sum(kube_node_info)',
        title: 'Node Count',
        yAxisMin: 0,
        yAxisUnit: 'Nodes',
    };
    const [prometheusData, setPrometheusData] = useState([] as any);

    useEffect(() => {
        const refreshPMData = async function () {
            const data = await api.getPrometheusData(BASE_HTTP_URL, query.queryString);
            setPrometheusData(data);
        };
        refreshPMData();
    }, [query.queryString]);


    return (
        <div className='charts_item'>
            {/* eslint-disable-next-line no-nested-ternary */}
            {prometheusData.length ? (
                <PrometheusGraph
                    queryString={query.queryString}
                    title={query.title}
                    yAxisMin={query.yAxisMin}
                    yAxisUnit={query.yAxisUnit}
                    prometheusData={prometheusData}
                />
            ) : items ? (
                <Chart used={readyCount} available={items.length} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Nodes</div>
            <div className='charts_itemSubLabel'>Ready vs All</div>
        </div>
    );
}

function getReadyStatus({status}: Node) {
    if (!status.conditions) return null;

    const ready = status.conditions.find(y => y.type === 'Ready');
    return ready && ready.status;
}
