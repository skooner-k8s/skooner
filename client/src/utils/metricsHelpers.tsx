import _ from 'lodash';
import {parseRam, parseCpu} from './unitHelpers';
import {TODO} from "./types";

export default function getMetrics(items: TODO[], metrics: TODO) {
    if (!items || !metrics) return null;

    const names = _.map(items, x => x.metadata.name);
    const filteredMetrics = metrics.filter((x: TODO) => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}


// Node helpers
export function getNodeResourceValue(node: TODO, pods: TODO, resource: string, type: string, phases: string[]) {
    if (!node || !pods) return null;

    return _(pods)
        .filter(x => x.spec.nodeName === node.metadata.name)
        .filter(x => !phases || phases.indexOf(x.status.phase) >= 0)
        .sumBy(x => getPodResourceValue(x, resource, type));
}

export function getNodeResourcePercent(node: TODO, pods: TODO, resource: string, type: string) {
    const used = getNodeResourceValue(node, pods, resource, type, ['Running']);
    const available = getNodeResourcesAvailable(node, resource);
    return used && available ? used / available: null;
}

export function getNodeUsagePercent(node: TODO, metrics: TODO, resource: string) {
    const used = getNodeUsage(node, metrics, resource);
    const available = getNodeResourcesAvailable(node, resource);
    return used && available ? used / available: null;
}

export function getNodeResourcesAvailable(node: TODO, resource: string) {
    return node ? parse(resource, node.status.capacity) : null;
}

export function getNodeUsage(node: TODO, metrics: TODO, resource: string) {
    if (!node || !metrics) return null;

    const result = metrics[node.metadata.name];
    return result ? parse(resource, result.usage) : null;
}


// Pod helpers
export function getPodResourcePercent(item: TODO, metrics: TODO, resource: string, type: string) {
    const actual = getPodUsage(item, metrics, resource);
    const request = getPodResourceValue(item, resource, type);
    return actual ? actual / request: null;
}

export function getPodUsage(pod: TODO, metrics: TODO, resource: string) {
    if (!pod || !metrics) return null;

    const metric = metrics[pod.metadata.name] || {};
    return _.sumBy(metric.containers, (x: TODO) => parse(resource, x.usage));
}

export function getPodResourceValue(pod: TODO, resource: string, type: string) {
    return _(pod.spec.containers)
        .filter(x => x.resources && x.resources[type])
        .sumBy(x => parse(resource, x.resources[type]));
}

function parse(resource: string, target: {[key: string]: string}) {
    const parser = resource === 'cpu' ? parseCpu : parseRam;
    return parser(target[resource]);
}
