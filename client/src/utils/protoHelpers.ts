import {k8s} from '../proto/proto';

const Unknown = k8s.io.apimachinery.pkg.runtime.Unknown;
const NodeMetrics = k8s.io.metrics.pkg.apis.metrics.v1beta1.NodeMetrics;
const NodeMetricsList = k8s.io.metrics.pkg.apis.metrics.v1beta1.NodeMetricsList;
const PodMetrics = k8s.io.metrics.pkg.apis.metrics.v1beta1.PodMetrics;
const PodMetricsList = k8s.io.metrics.pkg.apis.metrics.v1beta1.PodMetricsList;


export const kindMap: {
        [index: string]: {
            proto: typeof NodeMetrics | typeof NodeMetricsList | typeof PodMetrics | typeof PodMetricsList,
            path: string
        }
    } = {
    'NodeMetrics': {
        'proto': NodeMetrics,
        'path': '/apis/metrics.k8s.io/v1beta1/node'
    },
    'NodeMetricsList': {
        'proto': NodeMetricsList,
        'path': '/apis/metrics.k8s.io/v1beta1/nodes'
    },
    'PodMetrics': {
        'proto': PodMetrics,
        'path': '/apis/metrics.k8s.io/v1beta1/pod'
    },
    'PodMetricsList': {
        'proto': PodMetricsList,
        'path': '/apis/metrics.k8s.io/v1beta1/pods'
    }
};

export function parser(raw: Uint8Array) {
    // Skip the first 4 bytes magic number in k8s
    raw = raw.slice(4);
    const decoded = Unknown.decode(raw);
    const kind = decoded?.typeMeta?.kind;

    // Parse the raw byte body from Unknown message
    if (kind && Object.keys(kindMap).includes(kind)) {
        return {
            kind: decoded?.typeMeta?.kind,
            apiVersion: decoded?.typeMeta?.apiVersion,
            ...kindMap[kind].proto.decode(decoded.raw).toJSON()
        };
    } else {
        return {}
    }
}

export function isProtoEnabled(url: string): boolean {
    return window.localStorage.getItem('protoEnabled') === 'true';
}

export function isProtoEligible(url: string) {
    for (let [key, value] of Object.entries(kindMap)) {
        if (url.includes(value.path)) {
            return true;
        }
    }
    return false;
}

export function enableProto(): void {
    window.localStorage.setItem('protoEnabled', 'true')
}

export function disableProto(): void {
    window.localStorage.setItem('protoEnabled', 'false')
}
