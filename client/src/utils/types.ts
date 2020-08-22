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
    namespace?: string;
    labels: {[name: string]: string};
    ownerReferences?: {
        uid: string;
        kind: string;
        name: string;
    }[];
}

export interface Container {
    name: string;
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
    involvedObject: InvolvedObject;
}

interface ContainerStatus {
    restartCount: number;
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
    containerStatuses: ContainerStatus[];
}

export interface Pod extends ApiItem<PodSpec, PodStatus>{
}

interface PersistentVolumeSpec {
    storageClassName: string;
    accessModes?: string[];
    persistentVolumeReclaimPolicy?: string;
    local?: {
        path: string;
    };
    claimRef?: {
        namespace: string;
        name: string;
    };
    capacity: {
        cpu?: string;
        memory?: string;
        storage?: string;
    };
}

interface PersistentVolumeStatus {
    phase: string;
}

export interface PersistentVolume extends ApiItem<PersistentVolumeSpec, PersistentVolumeStatus> {

}

interface PersistentVolumeClaimSpec {
    storageClassName: string;
    volumeName: string;
    accessModes: string[];
}

interface PersistentVolumeClaimStatus {
    phase: string;
    capacity?: {
        storage: string;
    }
}

export interface PersistentVolumeClaim extends ApiItem<PersistentVolumeClaimSpec, PersistentVolumeClaimStatus> {

}

interface RoleRule {
    apiGroups?: string[];
    resources?: string[];
    nonResourceURLs?: string[];
    verbs?: string[];
    resourceNames?: string[];
}

interface RoleSpec {

}

interface RoleStatus {
}

export interface Role extends ApiItem<RoleSpec, RoleStatus> {
    rules?: RoleRule[];
}

interface ClusterRoleSpec {

}

interface ClusterRoleStatus {
}

export interface ClusterRole extends ApiItem<ClusterRoleSpec, ClusterRoleStatus> {
    rules?: RoleRule[];
}

export interface RoleBindingSubject {
    kind: string;
    name: string;
    namespace: string;
    apiGroup: string;
}

export interface RoleBindingRef {
    kind: string;
    name: string;
    namespace: string;
}

interface RoleBindingSpec {

}

interface RoleBindingStatus {
}

export interface RoleBinding extends ApiItem<RoleBindingSpec, RoleBindingStatus> {
    subjects: RoleBindingSubject[];
    roleRef: RoleBindingRef;
}

interface ClusterRoleBindingSpec {

}

interface ClusterRoleBindingStatus {
}

export interface ClusterRoleBinding extends ApiItem<ClusterRoleBindingSpec, ClusterRoleBindingStatus> {
    subjects: RoleBindingSubject[];
    roleRef: RoleBindingRef;
}

interface ConfigMapSpec {

}

interface ConfigMapStatus {
}

export interface ConfigMap extends ApiItem<ConfigMapSpec, ConfigMapStatus> {
    data: {[name: string]: string}
}

interface IngressPath {
    path: string;
    backend?: {
        serviceName: string;
        servicePort: string;
    }
}

interface IngressRule {
    host: string;
    http: {
        paths: IngressPath[];
    };
}

interface IngressSpec {
    rules: IngressRule[];
}

interface IngressStatus {
}

export interface Ingress extends ApiItem<IngressSpec, IngressStatus> {
}

interface ReplicaSetSpec {
    replicas: number;
    template: {
        spec: {

        }
    }
}

interface ReplicaSetStatus {
    observedGeneration: number;
    replicas: number;
}

export interface ReplicaSet extends ApiItem<ReplicaSetSpec, ReplicaSetStatus> {
}

interface SecretSpec {
}

interface SecretStatus {
}

export interface Secret extends ApiItem<SecretSpec, SecretStatus> {
    type: string;
    data: {[key: string]: string};
}

interface ServiceAccountSpec {
}

interface ServiceAccountStatus {
}

export interface ServiceAccount extends ApiItem<ServiceAccountSpec, ServiceAccountStatus> {
    secrets: {
        name: string;
    }[];
}

interface StorageClassSpec {
}

interface StorageClassStatus {
}

export interface StorageClass extends ApiItem<StorageClassSpec, StorageClassStatus> {
    reclaimPolicy: string;
    volumeBindingMode: string;
    provisioner: string;
}

interface HpaSpec {
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilizationPercentage: number;
}

interface HpaStatus {
}

export interface Hpa extends ApiItem<HpaSpec, HpaStatus> {
}

export interface Spec {

}

interface CronJobSpec {
    schedule: string;
    suspend: string;
    jobTemplate: {
        spec: {
            template: {
                spec: Spec;
            }
        }
    }
}

interface CronJobStatus {
    active?: TODO[];
    lastScheduleTime: string;
}

export interface CronJob extends ApiItem<CronJobSpec, CronJobStatus> {
}

interface DaemonSetSpec {
    template: {
        spec: Spec;
    }
}

interface DaemonSetStatus {
    numberAvailable: number;
    numberUnavailable: number;
    desiredNumberScheduled: number;
}

export interface DaemonSet extends ApiItem<DaemonSetSpec, DaemonSetStatus> {
}

interface JobSpec {
    template: {
        spec: Spec;
    }
}

interface JobStatus {
    active?: number;
    succeeded?: number;
    startTime: string;
    completionTime: string;
}

export interface Job extends ApiItem<JobSpec, JobStatus> {
}


interface DeploymentSpec {
    template: {
        spec: Spec;
    }
}

interface DeploymentStatus {
}

export interface Deployment extends ApiItem<DeploymentSpec, DeploymentStatus> {
}