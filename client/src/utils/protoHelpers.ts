import {k8s} from '../proto/proto';

const {Unknown} = k8s.io.apimachinery.pkg.runtime;
const {NodeMetrics} = k8s.io.metrics.pkg.apis.metrics.v1beta1;
const {NodeMetricsList} = k8s.io.metrics.pkg.apis.metrics.v1beta1;
const {PodMetrics} = k8s.io.metrics.pkg.apis.metrics.v1beta1;
const {PodMetricsList} = k8s.io.metrics.pkg.apis.metrics.v1beta1;
const {EventList} = k8s.io.api.core.v1;
const {NodeList} = k8s.io.api.core.v1;
const {PodList} = k8s.io.api.core.v1;

export const kindMap: {
        [index: string]: {
            proto: typeof NodeMetrics
                | typeof NodeMetricsList
                | typeof PodMetrics
                | typeof PodMetricsList
                | typeof EventList
                | typeof NodeList
                | typeof PodList,
            paths: string[]
        }
    } = {
        NodeMetrics: {
            proto: NodeMetrics,
            paths: ['/apis/metrics.k8s.io/v1beta1/node'],
        },
        NodeMetricsList: {
            proto: NodeMetricsList,
            paths: ['/apis/metrics.k8s.io/v1beta1/nodes'],
        },
        PodMetrics: {
            proto: PodMetrics,
            paths: ['/apis/metrics.k8s.io/v1beta1/pod'],
        },
        PodMetricsList: {
            proto: PodMetricsList,
            paths: ['/apis/metrics.k8s.io/v1beta1/pods'],
        },
        EventList: {
            proto: EventList,
            paths: ['api/v1/events'],
        },
        NodeList: {
            proto: NodeList,
            paths: ['api/v1/nodes'],
        },
        PodList: {
            proto: PodList,
            paths: ['api/v1/pods', 'v1beta1/namespaces/kube-system/pods', 'v1/namespaces/kube-system/pods'],
        },
    };

export function protoParser(raw: Uint8Array) {
    // Skip the first 4 bytes magic number in k8s and decode
    const decoded = Unknown.decode(raw.slice(4));
    const kind = decoded?.typeMeta?.kind;

    // Parse the raw byte body from Unknown message
    if (kind && Object.keys(kindMap).includes(kind)) {
        return {
            kind: decoded?.typeMeta?.kind,
            apiVersion: decoded?.typeMeta?.apiVersion,
            ...kindMap[kind].proto.decode(decoded.raw).toJSON(),
        };
    }
    return {};
}

export function isProtoEligible(url: string) {
    for (const value of Object.values(kindMap)) {
        if (value.paths.some(path => url.includes(path))) {
            return true;
        }
    }
    return false;
}
