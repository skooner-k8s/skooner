import * as cookie from 'js-cookie';

// If we have an "Authorization" cookie, use that as the token for future api calls
const authorizationCookie = cookie.get('Authorization');
if (authorizationCookie) {
    setToken(authorizationCookie);
    cookie.remove('Authorization');
}

export function getToken() {
    // This line deals with backwards compatability from when we used to only store the actual jwt
    if (localStorage.authToken && !localStorage.authToken.startsWith('Bearer ')) {
        localStorage.authToken = `Bearer ${localStorage.authToken}`;
    }

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
