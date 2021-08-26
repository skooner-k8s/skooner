import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import Chart from './chart';
import LoadingChart from './loadingChart';
import {parseRam, TO_GB} from '../utils/unitHelpers';
import {Pod, Metrics} from '../utils/types';
import PrometheusGraph, {BASE_HTTP_URL} from '../views/prometheusgraph';
import api from '../services/api';

export default function RamChart({items, metrics, pod}: {items?: Pod[], metrics?: _.Dictionary<Metrics>, pod?: Pod}) {
    const totals = getPodRamTotals(items, metrics);
    const decimals = totals && totals.used > 10 ? 1 : 2;

    const defaultLabels = "unit='byte'";
    const labelMatchers = pod ? `${defaultLabels}, pod="${pod.metadata.name}"` : defaultLabels;

    const query = {
        queryString: `sum(kube_pod_container_resource_requests{${labelMatchers}}/${TO_GB})`,
        title: 'Pod Memory Usage',
        yAxisMin: 0,
        yAxisUnit: 'GiB',
    };
    const [prometheusData, setPrometheusData] = useState([] as any);

    useEffect(() => {
        const refreshPMData = async function () {
            const data = await api.getPrometheusData(BASE_HTTP_URL, query.queryString);
            setPrometheusData(data);
        };
        refreshPMData();
    }, []);

    return (
        <div className='charts_item'>
            {prometheusData.length ? (
                <PrometheusGraph
                    queryString={query.queryString}
                    title={query.title}
                    yAxisMin={query.yAxisMin}
                    yAxisUnit={query.yAxisUnit}
                    prometheusData={prometheusData}
                />
            ) : totals ? (
                <Chart
                    decimals={decimals}
                    used={totals && totals.used}
                    usedSuffix='Gb'
                    available={totals && totals.available}
                    availableSuffix='Gb'
                />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Pod Ram Use</div>
            <div className='charts_itemSubLabel'>Actual vs Reserved</div>
        </div>
    );
}

export function getPodRamTotals(items?: Pod[], metrics?: _.Dictionary<Metrics>) {
    if (!items || !metrics) return null;

    const metricsContainers = Object.values(metrics).flatMap(x => x.containers);
    const podContainers = items
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests);

    const used = _.sumBy(metricsContainers, x => parseRam(x.usage.memory)) / TO_GB;
    const available = _.sumBy(podContainers, x => parseRam(x.resources?.requests?.memory)) / TO_GB;

    return {used, available};
}
