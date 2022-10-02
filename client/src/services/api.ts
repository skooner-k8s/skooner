import _ from 'lodash';
import {Base64} from 'js-base64';
import {request, post, stream, apiFactory, apiFactoryWithNamespace, requestText} from './apiProxy';
import log from '../utils/log';
import {K8sEvent, Namespace, TODO, Metrics, PersistentVolume, Node, Pod, ClusterRole, ClusterRoleBinding, ConfigMap, RoleBinding, Secret, ServiceAccount, StorageClass} from '../utils/types';

type DataCallback<T> = (data: T) => void;
type MetricsCallback = DataCallback<Metrics[]>;

const configMap = apiFactoryWithNamespace<ConfigMap>('', 'v1', 'configmaps');
const event = apiFactoryWithNamespace<K8sEvent>('', 'v1', 'events');
const namespaceService = apiFactory<Namespace>('', 'v1', 'namespaces');
const node = apiFactory<Node>('', 'v1', 'nodes');
const persistentVolume = apiFactory<PersistentVolume>('', 'v1', 'persistentvolumes');
const persistentVolumeClaim = apiFactoryWithNamespace('', 'v1', 'persistentvolumeclaims');
const pod = apiFactoryWithNamespace<Pod>('', 'v1', 'pods');
const secret = apiFactoryWithNamespace<Secret>('', 'v1', 'secrets');
const serviceAccount = apiFactoryWithNamespace<ServiceAccount>('', 'v1', 'serviceaccounts');
const serviceService = apiFactoryWithNamespace('', 'v1', 'services');

const clusterRole = apiFactory<ClusterRole>('rbac.authorization.k8s.io', 'v1', 'clusterroles');
const clusterRoleBinding = apiFactory<ClusterRoleBinding>('rbac.authorization.k8s.io', 'v1', 'clusterrolebindings');
const role = apiFactoryWithNamespace('rbac.authorization.k8s.io', 'v1', 'roles');
const roleBinding = apiFactoryWithNamespace<RoleBinding>('rbac.authorization.k8s.io', 'v1', 'rolebindings');

const daemonSet = apiFactoryWithNamespace('apps', 'v1', 'daemonsets');
const deployment = apiFactoryWithNamespace('apps', 'v1', 'deployments', true);
const replicaSet = apiFactoryWithNamespace('apps', 'v1', 'replicasets', true);
const statefulSet = apiFactoryWithNamespace('apps', 'v1', 'statefulsets', true);
const hpa = apiFactoryWithNamespace('autoscaling', 'v1', 'horizontalpodautoscalers', true);

const cronJob = apiFactoryWithNamespace('batch', 'v1beta1', 'cronjobs');
const job = apiFactoryWithNamespace('batch', 'v1', 'jobs');

const ingress = apiFactoryWithNamespace('networking.k8s.io', 'v1', 'ingresses');

const storageClass = apiFactory<StorageClass>('storage.k8s.io', 'v1', 'storageclasses');

const apis = {
    apply,
    testAuth,
    getRules,
    logs,
    logsAll,
    swagger,
    exec,
    metrics: metricsFactory(),
    oidc: oidcFactory(),

    clusterRole,
    namespace: namespaceService,
    node,
    persistentVolume,
    storageClass,
    clusterRoleBinding,
    configMap,
    cronJob,
    daemonSet,
    deployment,
    event,
    ingress,
    job,
    persistentVolumeClaim,
    pod,
    replicaSet,
    role,
    secret,
    service: serviceService,
    serviceAccount,
    statefulSet,
    roleBinding,
    hpa,
};

async function testAuth() {
    const spec = {namespace: 'default'};
    await post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews', {spec}, false);
}

function getRules(namespace: string) {
    return post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews', {spec: {namespace}});
}

async function apply(body: TODO): Promise<TODO> {
    const serviceName = _.camelCase(body.kind);

    // @ts-ignore
    const service = apis[serviceName];
    if (!service) {
        throw new Error(`No known service for kind: ${body.kind}`);
    }

    try {
        return await service.post(body);
    } catch (err) {
        // Check to see if failed because the record already exists.
        // If the failure isn't a 409 (i.e. Conflict), just rethrow.
        if (err.status !== 409) throw err;

        // We had a conflict. Try a PUT
        return service.put(body);
    }
}

function metricsFactory() {
    return {
        nodes: (cb: MetricsCallback) => metrics('/apis/metrics.k8s.io/v1beta1/nodes', cb),
        node: (name: string, cb: MetricsCallback) => metrics(`/apis/metrics.k8s.io/v1beta1/nodes/${name}`, cb),
        pods: (namespace: string | undefined, cb: MetricsCallback) => metrics(url(namespace), cb),
        // eslint-disable-next-line max-len
        pod: (namespace: string, name: string, cb: MetricsCallback) => metrics(`/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods/${name}`, cb),
    };

    function url(namespace?: string) {
        return namespace ? `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods` : '/apis/metrics.k8s.io/v1beta1/pods';
    }
}

function oidcFactory() {
    return {
        get: () => request('/oidc'),
        post: (code: string, redirectUri: string) => post('/oidc', {code, redirectUri}),
    };
}

function metrics(url: string, cb: MetricsCallback) {
    let isApiRequestInProgress = false;
    const handel = setInterval(getMetrics, 10000);
    getMetrics();

    async function getMetrics() {
        try {
            if (!isApiRequestInProgress) {
                isApiRequestInProgress = true;
                try {
                    const metric = await request(url);
                    cb(metric.items || metric);
                } catch (err) {
                    log.error('Unable to send request', {err});
                } finally {
                    isApiRequestInProgress = false;
                }
            }
        } catch (err) {
            log.error('No metrics', {err, url});
        }
    }

    return cancel;

    function cancel() {
        clearInterval(handel);
    }
}

function swagger() {
    return request('/openapi/v2');
}

function exec(namespace: string, name: string, container: string, cb: DataCallback<string[]>) {
    const url = `/api/v1/namespaces/${namespace}/pods/${name}/exec?container=${container}&command=sh&stdin=1&stderr=1&stdout=1&tty=1`;
    const additionalProtocols = ['v4.channel.k8s.io', 'v3.channel.k8s.io', 'v2.channel.k8s.io', 'channel.k8s.io'];
    return stream(url, cb, {additionalProtocols, isJson: false});
}

function logsAll(namespace: string, name: string, container: string, showPrevious: boolean) {
    const url = `/api/v1/namespaces/${namespace}/pods/${name}/log?container=${container}&previous=${showPrevious}`;
    return requestText(url);
}

function logs(namespace: string, name: string, container: string, tailLines: number, showPrevious: boolean, cb: DataCallback<string[]>) {
    const items: string[] = [];
    const url = `/api/v1/namespaces/${namespace}/pods/${name}/log?container=${container}&previous=${showPrevious}&tailLines=${tailLines}&follow=true`;
    const {cancel} = stream(url, transformer, {isJson: false, connectCb});
    return cancel;

    function connectCb() {
        items.length = 0;
    }

    function transformer(item: string) {
        if (!item) return; // For some reason, this api returns a lot of empty strings

        const message = Base64.decode(item);
        items.push(message);
        cb(items);
    }
}

export default apis;
