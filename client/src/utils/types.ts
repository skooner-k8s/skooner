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

export type Namespace = ApiItem<undefined, NamespaceStatus>

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

export type Node = ApiItem<NodeSpec, NodeStatus>

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
    initContainers?: Container[];
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

export type Pod = ApiItem<PodSpec, PodStatus>

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

export type PersistentVolume = ApiItem<PersistentVolumeSpec, PersistentVolumeStatus>

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

export type PersistentVolumeClaim = ApiItem<PersistentVolumeClaimSpec, PersistentVolumeClaimStatus>

interface RoleRule {
    apiGroups?: string[];
    resources?: string[];
    nonResourceURLs?: string[];
    verbs?: string[];
    resourceNames?: string[];
}

type RoleSpec = unknown;

type RoleStatus = unknown;

export interface Role extends ApiItem<RoleSpec, RoleStatus> {
    rules?: RoleRule[];
}

type ClusterRoleSpec = unknown;

type ClusterRoleStatus = unknown;

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

type RoleBindingSpec = unknown;

type RoleBindingStatus = unknown;

export interface RoleBinding extends ApiItem<RoleBindingSpec, RoleBindingStatus> {
    subjects: RoleBindingSubject[];
    roleRef: RoleBindingRef;
}

type ClusterRoleBindingSpec = unknown;

type ClusterRoleBindingStatus = unknown;

export interface ClusterRoleBinding extends ApiItem<ClusterRoleBindingSpec, ClusterRoleBindingStatus> {
    subjects: RoleBindingSubject[];
    roleRef: RoleBindingRef;
}

type ConfigMapSpec = unknown;

type ConfigMapStatus = unknown;

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

type IngressStatus = unknown;

export type Ingress = ApiItem<IngressSpec, IngressStatus>

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

export type ReplicaSet = ApiItem<ReplicaSetSpec, ReplicaSetStatus>

type SecretSpec = unknown;

type SecretStatus = unknown;

export interface Secret extends ApiItem<SecretSpec, SecretStatus> {
    type: string;
    data: {[key: string]: string};
}

type ServiceAccountSpec = unknown;

type ServiceAccountStatus = unknown;

export interface ServiceAccount extends ApiItem<ServiceAccountSpec, ServiceAccountStatus> {
    secrets: {
        name: string;
    }[];
}

type StorageClassSpec = unknown;

type StorageClassStatus = unknown;

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

type HpaStatus = unknown;

export type Hpa = ApiItem<HpaSpec, HpaStatus>

export type Spec = unknown;

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

export type CronJob = ApiItem<CronJobSpec, CronJobStatus>

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

export type DaemonSet = ApiItem<DaemonSetSpec, DaemonSetStatus>

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

export type Job = ApiItem<JobSpec, JobStatus>

interface DeploymentSpec {
    template: {
        spec: Spec;
    }
}

type DeploymentStatus = unknown;

export type Deployment = ApiItem<DeploymentSpec, DeploymentStatus>

interface StatefulSetSpec {
    template: {
        spec: Spec;
    }
}

type StatefulSetStatus = unknown;

export type StatefulSet = ApiItem<StatefulSetSpec, StatefulSetStatus>

interface Port {
    name: string;
    port: number;
    targetPort: number;
    protocol: string;
}

interface ServiceSpec {
    clusterIP: string;
    type: string;
    sessionAffinity: string;
    selector?: {
        app: string;
    }
    ports: Port[];
}

type ServiceStatus = unknown;

export type Service = ApiItem<ServiceSpec, ServiceStatus>
