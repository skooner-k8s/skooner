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

export function stream(url, cb, isJson = true, additionalProtocols) {
    let connection;
    let isCancelled;

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
        connection = connectStream(url, cb, onFail, isJson, additionalProtocols);
    }

    function onFail() {
        if (isCancelled) return;

        log.info('Reconnecting in 3 seconds', {url});
        setTimeout(connect, 3000);
    }
}

function connectStream(path, cb, onFail, isJson, additionalProtocols = []) {
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

    function onMessage(body) {
        if (isClosing) return;

        const item = isJson ? JSON.parse(body.data) : body.data;
        cb(item);
    }

    function onClose(...args) {
        if (isClosing) return;
        isClosing = true;

        socket.removeEventListener('message', onMessage);
        socket.removeEventListener('close', onClose);
        socket.removeEventListener('error', onError);

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

    const {cancel} = stream(watchUrl, x => cb(x.object));
    return cancel;
}

export async function streamResults(url, cb) {
    const results = {};

    const {kind, items, metadata} = await request(url);
    const fixedKind = kind.slice(0, -4); // Trim off the word "List" from the end of the string
    add();

    const watchUrl = `${url}?watch=1&resourceVersion=${metadata.resourceVersion}`;
    const {cancel} = stream(watchUrl, update);
    return cancel;

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
