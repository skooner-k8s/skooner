import _ from 'lodash';
import {parseRam, parseCpu} from './unitHelpers';
import {TODO, ApiItem, Pod, Node, Metrics, MetricsUsage} from './types';

export type ResourceType = 'cpu' | 'memory'

export default function getMetrics(items?: ApiItem<any, any>[], metrics?: Metrics[]) {
    if (!items || !metrics) return undefined;

    const names = _.map(items, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}


// Node helpers
export function getNodeResourceValue(
    node: Node | undefined,
    pods: Pod[] | undefined,
    resource: ResourceType,
    type: string,
    phases: string[],
) {
    if (!node || !pods) return null;

    return _(pods)
        .filter(x => x.spec.nodeName === node.metadata.name)
        .filter(x => !phases || phases.indexOf(x.status.phase) >= 0)
        .sumBy(x => getPodResourceValue(x, resource, type));
}

export function getNodeResourcePercent(
    node: Node,
    pods: Pod[] | undefined,
    resource: ResourceType,
    type: string,
) {
    const used = getNodeResourceValue(node, pods, resource, type, ['Running']);
    const available = getNodeResourcesAvailable(node, resource);
    return used && available ? used / available : null;
}

export function getNodeUsagePercent(
    node: Node,
    metrics: _.Dictionary<Metrics>,
    resource: ResourceType,
) {
    const used = getNodeUsage(node, metrics, resource);
    const available = getNodeResourcesAvailable(node, resource);
    return used && available ? used / available : null;
}

export function getNodeResourcesAvailable(node: Node, resource: ResourceType) {
    return node ? parse(resource, node.status.capacity) : null;
}

export function getNodeUsage(node: Node, metrics: _.Dictionary<Metrics>, resource: ResourceType) {
    if (!node || !metrics) return null;

    const result = metrics[node.metadata.name];
    return result ? parse(resource, result.usage) : null;
}


// Pod helpers
export function getPodResourcePercent(
    pod: Pod | undefined,
    metrics: _.Dictionary<Metrics> | undefined,
    resource: ResourceType,
    type: string,
) {
    const actual = getPodUsage(pod, metrics, resource);
    const request = getPodResourceValue(pod, resource, type);
    return actual ? actual / request : null;
}

export function getPodUsage(
    pod: Pod | undefined,
    metrics: _.Dictionary<Metrics> | undefined,
    resource: ResourceType,
) {
    if (!pod || !metrics) return undefined;

    const metric = metrics[pod.metadata.name] || {};
    return _.sumBy(metric.containers, x => parse(resource, x.usage));
}

export function getPodResourceValue(pod: TODO, resource: ResourceType, type: string) {
    return _(pod.spec.containers)
        .filter(x => x.resources && x.resources[type])
        .sumBy(x => parse(resource, x.resources[type]));
}

function parse(resource: ResourceType, target: MetricsUsage) {
    const parser = resource === 'cpu' ? parseCpu : parseRam;
    // @ts-ignore
    return parser(target[resource]);
}
