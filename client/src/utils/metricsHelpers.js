import _ from 'lodash';
import {parseCpu, parseRam} from './unitHelpers';

const TO_GB = 1024 * 1024 * 1024;
const TO_ONE_CPU = 1000000000;

export function getNodeMetrics(nodes, metrics) {
    if (!nodes || !metrics) return null;

    const names = _.map(nodes, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}

export function getNodeCpuTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseCpu(x.usage.cpu)) / TO_ONE_CPU;
    const available = _.sumBy(items, x => parseCpu(x.status.capacity.cpu)) / TO_ONE_CPU;

    return {used, available};
}

export function getNodeRamTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricValues = Object.values(metrics);
    const used = _.sumBy(metricValues, x => parseRam(x.usage.memory)) / TO_GB;
    const available = _.sumBy(items, x => parseRam(x.status.capacity.memory)) / TO_GB;

    return {used, available};
}


export function getPodMetrics(pods, metrics) {
    if (!pods || !metrics) return null;

    const names = _.map(pods, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}

export function getPodCpuTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricsContainers = Object.values(metrics).flatMap(x => x.containers);
    const podContainers = items
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests);

    const used = _.sumBy(metricsContainers, x => parseCpu(x.usage.cpu)) / TO_ONE_CPU;
    const available = _.sumBy(podContainers, x => parseCpu(x.resources.requests.cpu)) / TO_ONE_CPU;

    return {used, available};
}

export function getPodRamTotals(items, metrics) {
    if (!items || !metrics) return null;

    const metricsContainers = Object.values(metrics).flatMap(x => x.containers);
    const podContainers = items
        .flatMap(x => x.spec.containers)
        .filter(x => x.resources && x.resources.requests);

    const used = _.sumBy(metricsContainers, x => parseRam(x.usage.memory)) / TO_GB;
    const available = _.sumBy(podContainers, x => parseRam(x.resources.requests.memory)) / TO_GB;

    return {used, available};
}
