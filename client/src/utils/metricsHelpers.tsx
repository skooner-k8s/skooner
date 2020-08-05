import _ from 'lodash';
import {parseRam, parseCpu} from './unitHelpers';

export default function getMetrics(items: any[], metrics: any[]) {
    if (!items || !metrics) return null;

    const names = _.map(items, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}


// Node helpers
export function getNodeResourceValue(node: {[key: string]: any}, pods: any[], resource: string, type: string, phases: string[]) {
    if (!node || !pods) return null;

    return _(pods)
        .filter(x => x.spec.nodeName === node.metadata.name)
        .filter(x => !phases || phases.indexOf(x.status.phase) >= 0)
        .sumBy(x => getPodResourceValue(x, resource, type));
}

export function getNodeResourcePercent(node: {[key: string]: any}, pods: any[], resource: string, type: string) {
    const used = getNodeResourceValue(node, pods, resource, type, ['Running']);
    const available = getNodeResourcesAvailable(node, resource);
    return used && available ? used / available: null;
}

export function getNodeUsagePercent(node: {[key: string]: any}, metrics: {[key: string]: any}, resource: string) {
    const used = getNodeUsage(node, metrics, resource);
    const available = getNodeResourcesAvailable(node, resource);
    return used && available ? used / available: null;
}

export function getNodeResourcesAvailable(node: {[key: string]: any}, resource: string) {
    return node ? parse(resource, node.status.capacity) : null;
}

export function getNodeUsage(node: {[key: string]: any}, metrics: {[key: string]: any}, resource: string) {
    if (!node || !metrics) return null;

    const result = metrics[node.metadata.name];
    return result ? parse(resource, result.usage) : null;
}


// Pod helpers
export function getPodResourcePercent(item: any, metrics: {[key: string]: any}, resource: string, type: string) {
    const actual = getPodUsage(item, metrics, resource);
    const request = getPodResourceValue(item, resource, type);
    return actual ? actual / request: null;
}

export function getPodUsage(pod: {[key: string]: any}, metrics: {[key: string]: any}, resource: string) {
    if (!pod || !metrics) return null;

    const metric = metrics[pod.metadata.name] || {};
    return _.sumBy(metric.containers, (x: any) => parse(resource, x.usage));
}

export function getPodResourceValue(pod: {[key: string]: any}, resource: string, type: string) {
    return _(pod.spec.containers)
        .filter(x => x.resources && x.resources[type])
        .sumBy(x => parse(resource, x.resources[type]));
}

function parse(resource: string, target: {[key: string]: string}) {
    const parser = resource === 'cpu' ? parseCpu : parseRam;
    return parser(target[resource]);
}
