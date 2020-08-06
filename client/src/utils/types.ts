export type TODO = any;

export type ApiItem<TSpec, TStatus> = {
    kind: string;
    metadata: Metadata;
    spec: TSpec;
    status: TStatus
}

interface Metadata {
    uid: string;
    resourceVersion: string;
    name: string;
}

interface Container {
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

export interface Metrics extends ApiItem<undefined, undefined> {
    containers: Container[];
}

interface NamespaceStatus {
    phase: string;
}

export interface Namespace extends ApiItem<undefined, NamespaceStatus> {
}

export interface Node extends ApiItem<undefined, undefined> {

}

export interface K8sEvent extends ApiItem<undefined, undefined>{
}

interface PodSpec {
    nodeName: string;
    containers: Container[];
}

interface PodStatus {
    phase: string;
}

export interface Pod extends ApiItem<PodSpec, PodStatus>{
}