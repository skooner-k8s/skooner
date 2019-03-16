import log from '../utils/log';

const {host, href, hash, search} = window.location;
const nonHashedUrl = href.replace(hash, '').replace(search, '');
const BASE_HTTP_URL = host === 'localhost:4653' ? 'http://localhost:4654' : nonHashedUrl;
const BASE_WS_URL = BASE_HTTP_URL.replace('http', 'ws');

export function getToken() {
    return localStorage.authToken;
}

export function getUserInfo() {
    const user = getToken().split('.')[1];
    return JSON.parse(atob(user));
}

export function hasToken() {
    return !!getToken();
}

export function setToken(token) {
    localStorage.authToken = token;
}

export function deleteToken() {
    delete localStorage.authToken;
}

export function logout() {
    deleteToken();
    window.location.reload();
}

export async function request(path, params, autoLogoutOnAuthError = true) {
    const opts = Object.assign({headers: {}}, params);

    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;

    const url = combinePath(BASE_HTTP_URL, path);
    const response = await fetch(url, opts);

    if (!response.ok) {
        const {status, statusText} = response;
        if (autoLogoutOnAuthError && (status === 401 || status === 403)) {
            log.error('Logging out due to auth error', {status, statusText, path});
            logout();
        }

        const error = new Error(`Api request error: ${statusText}`);
        error.status = status;
        throw error;
    }

    return response.json();
}

export function stream(url, cb, isJson = true) {
    const current = {};
    connect();

    return cancel;

    function cancel() {
        if (current.cancelHandler) current.cancelHandler();
    }

    function connect() {
        current.cancelHandler = connectStream(url, cb, onFail, isJson);
    }

    function onFail() {
        log.info('Reconnecting in 3 seconds', {url});
        setTimeout(connect, 3000);
    }
}

function connectStream(path, cb, onFail, isJson) {
    let isClosing = false;

    const token = getToken();
    const encodedToken = btoa(token).replace(/=/g, '');

    const protocols = [
        `base64url.bearer.authorization.k8s.io.${encodedToken}`,
        'base64.binary.k8s.io',
    ];

    const url = combinePath(BASE_WS_URL, path);
    const socket = new WebSocket(url, protocols);
    socket.onmessage = onMessage;
    socket.onclose = onClose;
    socket.onerror = onError;

    return close;

    function close() {
        isClosing = true;
        socket.close();
    }

    function onMessage({data}) {
        const item = isJson ? JSON.parse(data) : data;
        cb(item);
    }

    function onClose(...args) {
        if (isClosing) return;

        log.warn('Socket closed unexpectedly', {path, args});
        onFail();
    }

    function onError(err) {
        log.error('Error in api stream', {err, path});
    }
}

export async function streamResult(url, name, cb) {
    const item = await request(`${url}/${name}`);
    cb(item);

    const fieldSelector = encodeURIComponent(`metadata.name=${name}`);
    const watchUrl = `${url}?watch=1&fieldSelector=${fieldSelector}`;

    return stream(watchUrl, x => cb(x.object));
}

export async function streamResults(url, cb) {
    const results = {};

    const {kind, items, metadata} = await request(url);
    const fixedKind = kind.slice(0, -4); // Trim off the word "List" from the end of the string
    add();

    const watchUrl = `${url}?watch=1&resourceVersion=${metadata.resourceVersion}`;
    return stream(watchUrl, update);

    function add() {
        for (const item of items) {
            item.kind = fixedKind;
            results[item.metadata.uid] = item;
        }

        push(results, cb);
    }

    function update({type, object}) {
        object.actionType = type; // eslint-disable-line no-param-reassign

        switch (type) {
            case 'ADDED':
                results[object.metadata.uid] = object;
                break;
            case 'MODIFIED': {
                const existing = results[object.metadata.uid];
                const currentVersion = parseInt(existing.metadata.resourceVersion, 10);
                const newVersion = parseInt(object.metadata.resourceVersion, 10);
                if (currentVersion < newVersion) {
                    Object.assign(existing, object);
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
                log.error('Unknown update type', type);
        }

        push(results, cb);
    }
}

function push(results, cb) {
    const items = Object.values(results);
    cb(items);
}

function combinePath(base, path) {
    if (base.endsWith('/')) base = base.slice(0, -1); // eslint-disable-line no-param-reassign
    if (path.startsWith('/')) path = path.slice(1); // eslint-disable-line no-param-reassign
    return `${base}/${path}`;
}
