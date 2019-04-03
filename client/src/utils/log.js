
function info(message, args) {
    console.log(now(), message, args); // eslint-disable-line no-console
}

function warn(message, args) {
    console.warn(now(), message, args); // eslint-disable-line no-console
}

function error(message, args) {
    console.error(now(), message, args); // eslint-disable-line no-console
}

function now() {
    return new Date().toLocaleTimeString();
}

export default {info, warn, error};
