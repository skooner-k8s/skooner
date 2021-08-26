import _ from 'lodash';
import React from 'react';
import LoadingChart from './loadingChart';
import {parseRam, TO_GB} from '../utils/unitHelpers';
import {Pod, Metrics, ReplicaSet} from '../utils/types';
import PrometheusGraph from '../views/prometheusgraph';

export default function RamChart({items, metrics, item}: {items?: Pod[], metrics?: _.Dictionary<Metrics>, item?: Pod | ReplicaSet}) {
    const totals = getPodRamTotals(items, metrics);

    const defaultLabels = "unit='byte'";
    const labelMatchers = item ? `${defaultLabels}, pod="${item.metadata.name}"` : defaultLabels;

    const query = {
        queryString: `sum(kube_pod_container_resource_requests{${labelMatchers}}/${TO_GB})`,
        title: 'Pod Memory Usage',
        yAxisMin: 0,
        yAxisUnit: 'GiB',
    };


    return (
        <div className='charts_item'>
            {totals ? (
                <PrometheusGraph
                    queryString={query.queryString}
                    title={query.title}
                    yAxisMin={query.yAxisMin}
                    yAxisUnit={query.yAxisUnit}
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
