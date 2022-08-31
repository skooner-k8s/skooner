import _ from 'lodash';
import * as cookie from 'js-cookie';

type Handler = () => void;
const handlers: Handler[] = [];

// If we have an "Authorization" cookie, use that as the token for future api calls
const authorizationCookie = cookie.get('Authorization');
if (authorizationCookie) {
    setToken(authorizationCookie);
    cookie.remove('Authorization');
}

export function setToken(token: string) {
    localStorage.authToken = token;
    onTokenChange();
}

export function deleteToken() {
    delete localStorage.authToken;
    onTokenChange();
}

export function logout() {
    deleteToken();
    window.location.reload();
}

export function addHandler(handler: Handler) {
    handlers.push(handler);
    return () => {
        _.pull(handlers, handler);
    };
}

function onTokenChange() {
    handlers.forEach(x => x());
}
