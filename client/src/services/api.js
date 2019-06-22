import _ from 'lodash';
import {Base64} from 'js-base64';
import {request, stream, streamResult, streamResults} from './apiProxy';
import log from '../utils/log';

const JSON_HEADERS = {Accept: 'application/json', 'Content-Type': 'application/json'};

const apis = {
    apply,
    testAuth,
    getRules,
    logs,
    swagger,
    exec,
    metrics: metricsFactory(),
    oidc: oidcFactory(),

    // Non-namespaced apis
    clusterRole: apiFactory('/apis/rbac.authorization.k8s.io/v1', 'clusterroles'),
    namespace: apiFactory('/api/v1', 'namespaces'),
    node: apiFactory('/api/v1', 'nodes'),
    persistentVolume: apiFactory('/api/v1', 'persistentvolumes'),
    storageClass: apiFactory('/apis/storage.k8s.io/v1', 'storageclasses'),
    clusterRoleBinding: apiFactory('/apis/rbac.authorization.k8s.io/v1', 'clusterrolebindings'),

    // Namespaced apis
    configMap: apiFactoryWithNamespace('/api/v1', 'configmaps'),
    cronJob: apiFactoryWithNamespace('/apis/batch/v1beta1', 'cronjobs'),
    daemonSet: apiFactoryWithNamespace('/apis/apps/v1', 'daemonsets'),
    deployment: apiFactoryWithNamespace('/apis/apps/v1', 'deployments', true),
    event: apiFactoryWithNamespace('/api/v1', 'events'),
    ingress: apiFactoryWithNamespace('/apis/extensions/v1beta1', 'ingresses'),
    job: apiFactoryWithNamespace('/apis/batch/v1', 'jobs'),
    persistentVolumeClaim: apiFactoryWithNamespace('/api/v1', 'persistentvolumeclaims'),
    pod: apiFactoryWithNamespace('/api/v1', 'pods'),
    replicaSet: apiFactoryWithNamespace('/apis/apps/v1', 'replicasets', true),
    role: apiFactoryWithNamespace('/apis/rbac.authorization.k8s.io/v1', 'roles'),
    secret: apiFactoryWithNamespace('/api/v1', 'secrets'),
    service: apiFactoryWithNamespace('/api/v1', 'services'),
    serviceAccount: apiFactoryWithNamespace('/api/v1', 'serviceaccounts'),
    statefulSet: apiFactoryWithNamespace('/apis/apps/v1', 'statefulsets', true),
    roleBinding: apiFactoryWithNamespace('/apis/rbac.authorization.k8s.io/v1', 'rolebindings'),
};

async function testAuth() {
    const spec = {namespace: 'default'};
    await post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews', {spec}, false);
}

function getRules(namespace) {
    return post('/apis/authorization.k8s.io/v1/selfsubjectrulesreviews', {spec: {namespace}});
}

async function apply(body) {
    const serviceName = _.camelCase(body.kind);
    const service = apis[serviceName];
    if (!service) {
        throw new Error(`No known service for kind: ${body.kind}`);
    }

    try {
        return await service.post(body);
    } catch (err) {
        // Check to see if failed because the record already exists.
        // If the failure isn't a 409 (i.e. Confilct), just rethrow.
        if (err.status !== 409) throw err;

        // We had a confilct. Try a PUT
        return service.put(body);
    }
}

function metricsFactory() {
    return {
        nodes: cb => metrics('/apis/metrics.k8s.io/v1beta1/nodes', cb),
        node: (name, cb) => metrics(`/apis/metrics.k8s.io/v1beta1/nodes/${name}`, cb),
        pods: (namespace, cb) => metrics(url(namespace), cb),
        pod: (namespace, name, cb) => metrics(`/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods/${name}`, cb),
    };

    function url(namespace) {
        return namespace ? `/apis/metrics.k8s.io/v1beta1/namespaces/${namespace}/pods` : '/apis/metrics.k8s.io/v1beta1/pods';
    }
}

function oidcFactory() {
    return {
        get: () => request('/oidc'),
        post: (code, redirectUri) => post('/oidc', {code, redirectUri}),
    };
}

function metrics(url, cb) {
    const handel = setInterval(getMetrics, 10000);
    getMetrics();

    async function getMetrics() {
        try {
            const metric = await request(url);
            cb(metric.items || metric);
        } catch (err) {
            log.error('No metrics', {err, url});
        }
    }

    return cancel;

    function cancel() {
        clearInterval(handel);
    }
}

function apiFactory(apiType, kind) {
    const url = `${apiType}/${kind}`;
    return {
        list: (cb, errCb) => streamResults(url, cb, errCb),
        get: (name, cb, errCb) => streamResult(url, name, cb, errCb),
        post: body => post(url, body),
        put: body => put(`${url}/${body.metadata.name}`, body),
        delete: name => del(`${url}/${name}`),
    };
}

function apiFactoryWithNamespace(apiType, kind, includeScale) {
    const results = {
        list: (namespace, cb, errCb) => streamResults(url(namespace), cb, errCb),
        get: (namespace, name, cb, errCb) => streamResult(url(namespace), name, cb, errCb),
        post: body => post(url(body.metadata.namespace), body),
        put: body => put(`${url(body.metadata.namespace)}/${body.metadata.name}`, body),
        delete: (namespace, name) => del(`${url(namespace)}/${name}`),
    };

    if (includeScale) {
        results.scale = apiScaleFactory(apiType, kind);
    }

    return results;

    function url(namespace) {
        return namespace ? `${apiType}/namespaces/${namespace}/${kind}` : `${apiType}/${kind}`;
    }
}

function apiScaleFactory(apiType, kind) {
    return {
        get: (namespace, name) => request(url(namespace, name)),
        put: body => put(url(body.metadata.namespace, body.metadata.name), body),
    };

    function url(namespace, name) {
        return `${apiType}/namespaces/${namespace}/${kind}/${name}/scale`;
    }
}

function swagger() {
    return request('/openapi/v2');
}

function exec(namespace, name, container, cb) {
    const url = `/api/v1/namespaces/${namespace}/pods/${name}/exec?container=${container}&command=sh&stdin=1&stderr=1&stdout=1&tty=1`;
    const additionalProtocols = ['v4.channel.k8s.io', 'v3.channel.k8s.io', 'v2.channel.k8s.io', 'channel.k8s.io'];
    return stream(url, cb, {additionalProtocols, isJson: false});
}

function logs(namespace, name, container, tailLines, showPrevious, cb) {
    const items = [];
    const url = `/api/v1/namespaces/${namespace}/pods/${name}/log?container=${container}&previous=${showPrevious}&tailLines=${tailLines}&follow=true`;
    const {cancel} = stream(url, transformer, {isJson: false, connectCb});
    return cancel;

    function connectCb() {
        items.length = 0;
    }

    function transformer(item) {
        if (!item) return; // For some reason, this api returns a lot of empty strings

        const message = Base64.decode(item);
        items.push(message);
        cb(items);
    }
}

function post(url, json, autoLogoutOnAuthError = true) {
    const body = JSON.stringify(json);
    const opts = {method: 'POST', body, headers: JSON_HEADERS};
    return request(url, opts, autoLogoutOnAuthError);
}

function put(url, json, autoLogoutOnAuthError = true) {
    const body = JSON.stringify(json);
    const opts = {method: 'PUT', body, headers: JSON_HEADERS};
    return request(url, opts, autoLogoutOnAuthError);
}

function del(url) {
    const opts = {method: 'DELETE', headers: JSON_HEADERS};
    return request(url, opts);
}

export default apis;
