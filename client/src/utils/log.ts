
function info(message: string, args?: object) {
    console.log(now(), message, args); // eslint-disable-line no-console
}

function warn(message: string, args?: object) {
    console.warn(now(), message, args); // eslint-disable-line no-console
}

function error(message: string, args?: object) {
    console.error(now(), message, args); // eslint-disable-line no-console
}

function now() {
    return new Date().toLocaleTimeString();
}

export default {info, warn, error};
