const cors = require('cors');
const express = require('express');
const http = require('http');
const https = require('https');
const k8s = require('@kubernetes/client-node');
const proxy = require('http-proxy-middleware');
const toString = require('stream-to-string');
const {Issuer} = require('openid-client');

const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID;
const OIDC_SECRET = process.env.OIDC_SECRET;
const OIDC_URL = process.env.OIDC_URL;
console.log('OIDC_URL: ', OIDC_URL || 'None');

process.on('uncaughtException', err => {
    console.error('Uncaught exception', err);
});

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const opts = {};
kc.applyToRequest(opts);

const target = kc.getCurrentCluster().server;
const agent = new https.Agent({ca: opts.ca});
const proxySettings = {target, agent, secure: false, ws: true, onError};

const app = express();
app.disable('x-powered-by'); // for security reasons, best not to tell attackers too much about our backend
app.use(cors());

app.use(logging);
app.use('/', express.static('public'));
app.get('/oidc', getOidc);
app.post('/oidc', postOidc);
app.use('/*', proxy(proxySettings));
app.use(handleErrors);

const server = http.createServer(app);
server.listen(4654);
console.log('Server started');

function logging(req, res, next) {
    console.log(req.method, req.url);
    next();
}

async function getOidc(req, res) {
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

function handleErrors(err, req, res, next) {
    console.error('An error occured during the request', err, req.method, req.url);

    res.status(err.httpStatusCode || 500);
    res.send('Server serror');
    next();
}

async function getOidcEndpoint(redirectUri) { // TODO: gotta pass this in from
    if (!OIDC_URL) return;

    const provider = await getOidcProvider();
    return provider.authorizationUrl({redirect_uri: redirectUri, scope: 'openid email'});
}

async function oidcAuthenticate(code, redirectUri) {
    const provider = await getOidcProvider();
    const tokenSet = await provider.authorizationCallback(redirectUri, {code}, {});
    return tokenSet.id_token;
}

async function getOidcProvider() {
    const issuer = await Issuer.discover(OIDC_URL);
    return new issuer.Client({client_id: OIDC_CLIENT_ID, client_secret: OIDC_SECRET});
}
