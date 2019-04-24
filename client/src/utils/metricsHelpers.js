import _ from 'lodash';
import {parseRam, parseCpu} from './unitHelpers';

export default function getMetrics(items, metrics) {
    if (!items || !metrics) return null;

    const names = _.map(items, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}


// Node helpers
export function getNodeResourceValue(node, pods, resource, type) {
    if (!node || !pods) return null;

    return _(pods)
        .filter(x => x.spec.nodeName === node.metadata.name)
        .sumBy(x => getPodResourceValue(x, resource, type));
}

export function getNodeResourcePercent(node, pods, resource, type) {
    const used = getNodeResourceValue(node, pods, resource, type);
    const available = getNodeResourcesAvailable(node, resource);
    return used / available;
}

export function getNodeUsagePercent(node, metrics, resource) {
    const used = getNodeUsage(node, metrics, resource);
    const available = getNodeResourcesAvailable(node, resource);
    return used / available;
}

export function getNodeResourcesAvailable(node, resource) {
    if (!node) return null;
    return resource === 'cpu' ? parseCpu(node.status.capacity.cpu) : parseRam(node.status.capacity.memory);
}

export function getNodeUsage(node, metrics, resource) {
    if (!node || !metrics) return null;

    const result = metrics[node.metadata.name] || {};
    if (!result) return null;

    const value = resource === 'cpu' ? result.usage.cpu : result.usage.memory;
    const parser = resource === 'cpu' ? parseCpu : parseRam;
    return parser(value);
}


// Pod helpers
export function getPodResourcePercent(item, metrics, resource, type) {
    const actual = getPodUsage(item, metrics, resource);
    const request = getPodResourceValue(item, resource, type);
    return actual / request;
}

export function getPodUsage(pod, metrics, resource) {
    if (!pod || !metrics) return null;

    const metric = metrics[pod.metadata.name] || {};
    const parser = resource === 'cpu' ? parseCpu : parseRam;
    return _.sumBy(metric.containers, x => parser(x.usage[resource]));
}

export function getPodResourceValue(pod, resource, type) {
    const parser = resource === 'cpu' ? parseCpu : parseRam;

    return _(pod.spec.containers)
        .filter(x => x.resources && x.resources[type])
        .sumBy(x => parser(x.resources[type][resource]));
}
