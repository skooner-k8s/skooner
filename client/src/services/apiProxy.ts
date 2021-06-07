import _ from 'lodash';
import {getToken, logout} from './auth';
import log from '../utils/log';
import {ApiItem} from '../utils/types';
import {isProtoEligible, protoParser} from '../utils/protoHelpers';

type StreamCallback<T> = (data: T) => void;
type ErrorCallback = (err: Error) => void;
type FailCallback = () => void;

type StreamSocket = {
    cancel: () => void;
    getSocket: () => WebSocket;
};

type StreamArgs = {
    isJson: boolean;
    additionalProtocols?: string[];
    connectCb?: () => void;
}

const {hostname, href, hash, search} = window.location;
const nonHashedUrl = href.replace(hash, '').replace(search, '').replace('#', '');
const isDev = process.env.NODE_ENV !== 'production';
const BASE_HTTP_URL = isDev && hostname === 'localhost' ? 'http://localhost:4654' : nonHashedUrl;
const BASE_WS_URL = BASE_HTTP_URL.replace('http', 'ws');
const JSON_HEADERS = {Accept: 'application/json', 'Content-Type': 'application/json'};
const PROTO_HEADERS = {Accept: 'application/vnd.kubernetes.protobuf', 'Content-Type': 'application/json'};

async function requestInner(path: string, params?: any, autoLogoutOnAuthError = true, isProtobuf = false) {
    const opts = Object.assign({headers: {}}, params);

    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (isProtobuf) Object.assign(opts.headers, PROTO_HEADERS);

    const url = combinePath(BASE_HTTP_URL, path);
    const response = await fetch(url, opts);

    if (!response.ok) {
        const {status, statusText} = response;
        if (autoLogoutOnAuthError && status === 401 && token) {
            log.error('Logging out due to auth error', {status, statusText, path});
            logout();
        }

        let message = `Api request error: ${statusText}`;
        try {
            const json = await response.json();
            message += ` - ${json.message}`;
        } catch (err) {
            log.error('Unable to parse error json', {err});
        }

        const error = new Error(message);
        // @ts-ignore
        error.status = status;
        throw error;
    }

    return response;
}

export async function request(path: string, params?: any, autoLogoutOnAuthError = true) {
    if (isProtoEligible(path)) {
        return requestProto(path, params, autoLogoutOnAuthError);
    }
    return requestJson(path, params, autoLogoutOnAuthError);
}

export async function requestJson(path: string, params?: any, autoLogoutOnAuthError = true) {
    return (await requestInner(path, params, autoLogoutOnAuthError, false)).json();
}

export async function requestProto(path: string, params?: any, autoLogoutOnAuthError = true) {
    return (await requestInner(path, params, autoLogoutOnAuthError, true)).arrayBuffer().then((value => protoParser(new Uint8Array(value))));
}

export async function requestText(path: string, params?: any, autoLogoutOnAuthError = true) {
    return (await requestInner(path, params, autoLogoutOnAuthError)).text();
}

export function apiFactory<T extends ApiItem<any, any>>(group: string, version: string, resource: string) {
    const apiRoot = getApiRoot(group, version);
    const url = `${apiRoot}/${resource}`;
    return {
        resource: {group, resource},
        list: (cb: StreamCallback<T[]>, errCb?: ErrorCallback) => streamResults(url, cb, errCb),
        get: (name: string, cb: StreamCallback<T>, errCb?: ErrorCallback) => streamResult(url, name, cb, errCb),
        post: (body: any) => post(url, body),
        put: (body: any) => put(`${url}/${body.metadata.name}`, body),
        delete: (name: string) => remove(`${url}/${name}`),
    };
}

export function apiFactoryWithNamespace<T extends ApiItem<any, any>>(group: string, version: string, resource: string, includeScale = false) {
    const apiRoot = getApiRoot(group, version);
    return {
        resource: {group, resource},
        list: (namespace: string | undefined, cb: StreamCallback<T[]>, errCb?: ErrorCallback) => streamResults(url(namespace), cb, errCb),
        get: (namespace: string, name: string, cb: StreamCallback<T>, errCb?: ErrorCallback) => streamResult(url(namespace), name, cb, errCb),
        post: (body: any) => post(url(body.metadata.namespace), body),
        put: (body: any) => put(`${url(body.metadata.namespace)}/${body.metadata.name}`, body),
        delete: (namespace: string, name: string) => remove(`${url(namespace)}/${name}`),
        scale: includeScale ? apiScaleFactory(apiRoot, resource) : undefined,
    };

    function url(namespace?: string) {
        return namespace ? `${apiRoot}/namespaces/${namespace}/${resource}` : `${apiRoot}/${resource}`;
    }
}

function getApiRoot(group: string, version: string) {
    return group ? `/apis/${group}/${version}` : `api/${version}`;
}

function apiScaleFactory(apiRoot: string, resource: string) {
    return {
        get: (namespace: string, name: string) => request(url(namespace, name)),
        put: (body: any) => put(url(body.metadata.namespace, body.metadata.name), body),
    };

    function url(namespace: string, name: string) {
        return `${apiRoot}/namespaces/${namespace}/${resource}/${name}/scale`;
    }
}

export function post(url: string, json: any, autoLogoutOnAuthError = true) {
    const body = JSON.stringify(json);
    const opts = {method: 'POST', body, headers: JSON_HEADERS};
    return request(url, opts, autoLogoutOnAuthError);
}

export function put(url: string, json: any, autoLogoutOnAuthError = true) {
    const body = JSON.stringify(json);
    const opts = {method: 'PUT', body, headers: JSON_HEADERS};
    return request(url, opts, autoLogoutOnAuthError);
}

export function remove(url: string) {
    const opts = {method: 'DELETE', headers: JSON_HEADERS};
    return request(url, opts);
}

export async function streamResult<T>(url: string, name: string, cb: StreamCallback<T>, errCb?: ErrorCallback) {
    let isCancelled = false;
    let socket: StreamSocket;
    run();

    return cancel;

    async function run() {
        try {
            const item = await request(`${url}/${name}`);
            const debouncedCallback = _.debounce(cb, 250, {leading: true});

            if (isCancelled) return;
            debouncedCallback(item);

            const fieldSelector = encodeURIComponent(`metadata.name=${name}`);
            const watchUrl = `${url}?watch=1&fieldSelector=${fieldSelector}`;

            // TODO: fix me
            // @ts-ignore
            socket = stream<T>(watchUrl, x => debouncedCallback(x.object), {isJson: true});
        } catch (err) {
            log.error('Error in api request', {err, url});
            if (errCb) errCb(err);
        }
    }

    function cancel() {
        if (isCancelled) return;
        isCancelled = true;

        if (socket) socket.cancel();
    }
}

export async function streamResults<T extends ApiItem<any, any>>(url: string, cb: StreamCallback<T[]>, errCb?: ErrorCallback) {
    let isCancelled = false;
    let socket: StreamSocket;
    const results: {[id: string]: T} = {};

    const debouncedCallback = _.debounce(() => {
        const values = Object.values(results);
        cb(values);
    }, 250, {leading: true});

    run();

    return cancel;

    async function run() {
        try {
            const {kind, items, metadata} = await request(url);
            if (isCancelled) return;

            add(items, kind);

            const watchUrl = `${url}?watch=1&resourceVersion=${metadata.resourceVersion}`;
            socket = stream(watchUrl, update, {isJson: true});
        } catch (err) {
            log.error('Error in api request', {err, url});
            if (errCb) errCb(err);
        }
    }

    function cancel() {
        if (isCancelled) return;
        isCancelled = true;

        if (socket) socket.cancel();
    }

    function add(items: T[], kind: string) {
        const fixedKind = kind.slice(0, -4); // Trim off the word "List" from the end of the string
        for (const item of items) {
            item.kind = fixedKind;
            results[item.metadata.uid] = item;
        }

        debouncedCallback();
    }

    function update({type, object}: {type: string, object: T}) {
        // @ts-ignore
        object.actionType = type; // eslint-disable-line no-param-reassign

        switch (type) {
            case 'ADDED':
                results[object.metadata.uid] = object;
                break;
            case 'MODIFIED': {
                const existing = results[object.metadata.uid];

                if (existing) {
                    const currentVersion = parseInt(existing.metadata.resourceVersion, 10);
                    const newVersion = parseInt(object.metadata.resourceVersion, 10);
                    if (currentVersion < newVersion) {
                        Object.assign(existing, object);
                    }
                } else {
                    results[object.metadata.uid] = object;
                }

                break;
            }
            case 'DELETED':
                delete results[object.metadata.uid];
                break;
            case 'ERROR':
                log.error('Error in update', {type, object});
                break;
            default:
                log.error('Unknown update type', {type});
        }

        debouncedCallback();
    }
}

export function stream<T>(url: string, cb: StreamCallback<T>, args: StreamArgs) {
    let connection: {
        close: () => void;
        socket: WebSocket;
    };
    let isCancelled: boolean;
    const {isJson, additionalProtocols, connectCb} = args;

    connect();

    return {cancel, getSocket};

    function getSocket() {
        return connection.socket;
    }

    function cancel() {
        if (connection) connection.close();
        isCancelled = true;
    }

    function connect() {
        if (connectCb) connectCb();
        connection = connectStream<T>(url, cb, onFail, isJson, additionalProtocols);
    }

    function onFail() {
        if (isCancelled) return;

        log.info('Reconnecting in 3 seconds', {url});
        setTimeout(connect, 3000);
    }
}

function connectStream<T>(path: string, cb: StreamCallback<T>, onFail: FailCallback, isJson: boolean, additionalProtocols: string[] = []) {
    let isClosing = false;

    const token = getToken();
    const encodedToken = btoa(token).replace(/=/g, '');

    const protocols = [
        `base64url.bearer.authorization.k8s.io.${encodedToken}`,
        'base64.binary.k8s.io',
        ...additionalProtocols,
    ];

    const url = combinePath(BASE_WS_URL, path);
    const socket = new WebSocket(url, protocols);
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);

    return {close, socket};

    function close() {
        isClosing = true;
        socket.close();
    }

    function onMessage(body: any) {
        if (isClosing) return;

        const item = isJson ? JSON.parse(body.data) : body.data;
        cb(item);
    }

    function onClose(...args: any) {
        if (isClosing) return;
        isClosing = true;

        socket.removeEventListener('message', onMessage);
        socket.removeEventListener('close', onClose);
        socket.removeEventListener('error', onError);

        log.warn('Socket closed unexpectedly', {path, args});
        onFail();
    }

    function onError(err: any) {
        log.error('Error in api stream', {err, path});
    }
}

function combinePath(base: string, path: string) {
    if (base.endsWith('/')) base = base.slice(0, -1); // eslint-disable-line no-param-reassign
    if (path.startsWith('/')) path = path.slice(1); // eslint-disable-line no-param-reassign
    return `${base}/${path}`;
}
