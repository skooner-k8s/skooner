const cors = require('cors');
const express = require('express');
const http = require('http');
const https = require('https');
const k8s = require('@kubernetes/client-node');
const {createProxyMiddleware} = require('http-proxy-middleware');
const toString = require('stream-to-string');
const {Issuer} = require('openid-client');
const getCrypto = () =>
    typeof globalThis.crypto?.getRandomValues === 'function'
        ? globalThis.crypto
        : // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('crypto').webcrypto;

const crypto = getCrypto();

const NODE_ENV = process.env.NODE_ENV;
const DEBUG_VERBOSE = !!process.env.DEBUG_VERBOSE;
const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID;
const OIDC_SECRET = process.env.OIDC_SECRET;
const OIDC_URL = process.env.OIDC_URL;
const OIDC_SCOPES = process.env.OIDC_SCOPES || 'openid email';
const OIDC_USE_PKCE = process.env.OIDC_USE_PKCE === "true" || false;
const OIDC_METADATA = JSON.parse(process.env.OIDC_METADATA || '{}');
const clientMetadata = Object.assign({client_id: OIDC_CLIENT_ID, client_secret: OIDC_SECRET}, OIDC_METADATA);

/*
    Code copied from https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs
 */

// GENERATING CODE VERIFIER
function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}

function generateCodeVerifier() {
    var array = new Uint32Array(56 / 2);
    crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
}

// Generate code challenge from code verifier

function sha256(plain) {
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
    var str = "";
    var bytes = new Uint8Array(a);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function generateCodeChallengeFromVerifier(v) {
    var hashed = await sha256(v);
    var base64encoded = base64urlencode(hashed);
    return base64encoded;
}

/*
    End of code copied for PKCE
 */

const codeVerifier = generateCodeVerifier()

process.on('uncaughtException', err => console.error('Uncaught exception', err));

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const opts = {};
kc.applyToRequest(opts);

const target = kc.getCurrentCluster().server;
console.log('API URL: ', target);
const agent = new https.Agent({ca: opts.ca});
const proxySettings = {
    target,
    agent,
    ws: true,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onError,
};

if (DEBUG_VERBOSE) {
    proxySettings.onProxyRes = onProxyRes;
}

const app = express();
app.disable('x-powered-by'); // for security reasons, best not to tell attackers too much about our backend
app.use(logging);
if (NODE_ENV !== 'production') app.use(cors());
app.use('/', preAuth, express.static('public'));
app.get('/oidc', getOidc);
app.post('/oidc', postOidc);
app.use('/*', createProxyMiddleware(proxySettings));
app.use(handleErrors);

const port = process.env.SERVER_PORT || 4654;
http.createServer(app).listen(port);
console.log(`Server started. Listening on port ${port}`);

function preAuth(req, res, next) {
    const auth = req.header('Authorization');

    // If the request already contains an authorization header, pass it through to the client (as a cookie)
    if (auth && req.method === 'GET' && req.path === '/') {
        const value = auth.replace('Bearer ', '');
        res.cookie('Authorization', value, {maxAge: 60, httpOnly: false});
        console.log('Authorization header found. Passing through to client.');
    }

    next();
}

function logging(req, res, next) {
    res.once('finish', () => console.log(new Date(), req.method, req.url, res.statusCode));
    next();
}

async function getOidc(req, res, next) {
    try {
        const authEndpoint = await getOidcEndpoint();
        res.json({authEndpoint});
    } catch (err) {
        next(err);
    }
}

async function postOidc(req, res, next) {
    try {
        const body = await toString(req);
        const {code, redirectUri} = JSON.parse(body);
        const token = await oidcAuthenticate(code, redirectUri);
        res.json({token});
    } catch (err) {
        next(err);
    }
}

function onError(err, req, res) {
    console.log('Error in proxied request', err, req.method, req.url);
}

const SENSITIVE_HEADER_KEYS = ['authorization'];

function scrubHeaders(headers) {
    const res = Object.assign({}, headers);
    SENSITIVE_HEADER_KEYS.forEach(function(key) {
        if (res.hasOwnProperty(key)) {
            delete res[key];
        }
    });
    return res;
}

function onProxyRes(proxyRes, req, res) {
    const reqHeaders = scrubHeaders(req.headers);
    console.log('VERBOSE REQUEST', req.method, req.protocol, req.hostname, req.url, reqHeaders);
    const proxyResHeaders = scrubHeaders(proxyRes.headers);
    console.log('VERBOSE RESPONSE', proxyRes.statusCode, proxyResHeaders);
}

function handleErrors(err, req, res, next) {
    console.error('An error occurred during the request', err, req.method, req.url);

    res.status(err.httpStatusCode || 500);
    res.send('Server error');
    next();
}

async function getOidcEndpoint() {
    if (!OIDC_URL) return;

    const provider = await getOidcProvider();
    let authParams = {
        scope: OIDC_SCOPES,
    }
    if (OIDC_USE_PKCE) {
        const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier)
        authParams = {
            ...authParams,
            code_challenge: codeChallenge,
            code_challenge_method: "S256"
        }
    }
    return provider.authorizationUrl(authParams);
}

async function oidcAuthenticate(code, redirectUri) {
    const provider = await getOidcProvider();
    let authCheckParams = {}
    if (OIDC_USE_PKCE) {
        authCheckParams = {
            ...authCheckParams,
            code_verifier: codeVerifier
        }
    }
    const tokenSet = await provider.callback(redirectUri, {code}, authCheckParams);
    return tokenSet.id_token;
}

async function getOidcProvider() {
    const issuer = await Issuer.discover(OIDC_URL);
    return new issuer.Client(clientMetadata);
}

logClusterInfo();
async function logClusterInfo() {
    try {
        const versionClient = kc.makeApiClient(k8s.VersionApi);
        const versionResponse = await versionClient.getCode();
        const versionJson = JSON.stringify(versionResponse.body, null, 4);
        console.log('Version Info: ', versionJson);

        const apisClient = kc.makeApiClient(k8s.ApisApi);
        const apisResponse = await apisClient.getAPIVersions();
        const apis = apisResponse.body.groups.map(x => x.preferredVersion.groupVersion).sort();
        const apisJson = JSON.stringify(apis, null, 4);
        console.log('Available APIs: ', apisJson);
    } catch (err) {
        console.error('Error getting cluster info', err);
    }
}
