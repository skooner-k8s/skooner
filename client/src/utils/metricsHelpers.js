import _ from 'lodash';
import {parseRam, parseCpu} from './unitHelpers';

export default function getMetrics(items, metrics) {
    if (!items || !metrics) return null;

    const names = _.map(items, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}


// Node helpers
export function getNodeResourceValue(node, pods, resource, type, phases) {
    if (!node || !pods) return null;

    return _(pods)
        .filter(x => x.spec.nodeName === node.metadata.name)
        .filter(x => !phases || phases.indexOf(x.status.phase) >= 0)
        .sumBy(x => getPodResourceValue(x, resource, type));
}

export function getNodeResourcePercent(node, pods, resource, type) {
    const used = getNodeResourceValue(node, pods, resource, type, ['Running']);
    const available = getNodeResourcesAvailable(node, resource);
    return used / available;
}

export function getNodeUsagePercent(node, metrics, resource) {
    const used = getNodeUsage(node, metrics, resource);
    const available = getNodeResourcesAvailable(node, resource);
    return used / available;
}

export function getNodeResourcesAvailable(node, resource) {
    return node ? parse(resource, node.status.capacity) : null;
}

export function getNodeUsage(node, metrics, resource) {
    if (!node || !metrics) return null;

    const result = metrics[node.metadata.name];
    return result ? parse(resource, result.usage) : null;
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
    return _.sumBy(metric.containers, x => parse(resource, x.usage));
}

export function getPodResourceValue(pod, resource, type) {
    return _(pod.spec.containers)
        .filter(x => x.resources && x.resources[type])
        .sumBy(x => parse(resource, x.resources[type]));
}

function parse(resource, target) {
    const parser = resource === 'cpu' ? parseCpu : parseRam;
    return parser(target[resource]);
}
