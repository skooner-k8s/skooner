export type TODO = any;

export type ApiItem<TSpec, TStatus> = {
    kind: string;
    apiVersion: string;
    metadata: Metadata;
    spec: TSpec;
    status: TStatus;
    involvedObject?: InvolvedObject;
}

export interface InvolvedObject {
    uid: string;
    kind: string;
    namespace: string;
    name: string;
}

interface Metadata {
    uid: string;
    resourceVersion: string;
    creationTimestamp: number;
    name: string;
    labels: {[name: string]: string};
    ownerReferences?: {
        uid: string;
        kind: string;
        name: string;
    }[];
}

interface Container {
    name?: string;
    image?: string;
    args?: string[];
    resources?: {
        requests?: {
            cpu?: string;
            memory?: string;
        }
    }
    usage: {
        cpu?: string;
        memory?: string;
    }
}

interface Condition {
    type: string;
    status: string;
    lastTransitionTime: number;
    reason: string;
    message: string;
}

export interface MetricsUsage {
    cpu?: string;
    memory?: string;
}

export interface Metrics extends ApiItem<undefined, undefined> {
    containers: Container[];
    resources?: {
        requests?: {
            cpu?: string;
            memory?: string;
        }
    }
    usage: MetricsUsage
}

interface NamespaceStatus {
    phase: string;
}

export interface Namespace extends ApiItem<undefined, NamespaceStatus> {
}

interface NodeSpec {
    taints: {[name: string]: string}
}

export interface NodeStatus {
    capacity: {
        cpu?: string;
        memory?: string;
    }
    conditions: Condition[];
    nodeInfo: {
        kernelVersion: string;
        osImage: string;
        operatingSystem: string;
        architecture: string;
        containerRuntimeVersion: string;
        kubeletVersion: string;
        kubeProxyVersion: string;
    }
}

export interface Node extends ApiItem<NodeSpec, NodeStatus> {

}

export interface K8sEvent extends ApiItem<undefined, undefined> {
    type: string;
    reason: string;
    message: string;
}

interface PodSpec {
    nodeName: string;
    containers: Container[];
    nodeSelector?: {[key: string]: string};
}

interface PodStatus {
    phase: string;
    hostIP: string;
    podIP: string;
    qosClass: string;
    message: string;
    conditions?: Condition[];
}

export interface Pod extends ApiItem<PodSpec, PodStatus>{
}