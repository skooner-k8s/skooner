import _ from 'lodash';

const RAM_TYPES = ['Bi', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'];

export const TO_GB = 1024 * 1024 * 1024;
export const TO_ONE_M_CPU = 1000000;
export const TO_ONE_CPU = 1000000000;

export function parseDiskSpace(value) {
    if (!value) return 0;

    const number = parseInt(value, 10);
    if (value.endsWith('Ki')) return number * 1024;
    if (value.endsWith('Mi')) return number * 1024 * 1024;
    if (value.endsWith('Gi')) return number * 1024 * 1024 * 1024;
    if (value.endsWith('Ti')) return number * 1024 * 1024 * 1024 * 1024;
    if (value.endsWith('Pi')) return number * 1024 * 1024 * 1024 * 1024 * 1024;
    if (value.endsWith('Ei')) return number * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;

    return number;
}

export function parseRam(value) {
    if (!value) return 0;

    const number = parseInt(value, 10);
    if (value.endsWith('Ki')) return number * 1024;
    if (value.endsWith('Mi')) return number * 1024 * 1024;
    if (value.endsWith('Gi')) return number * 1024 * 1024 * 1024;
    if (value.endsWith('Ti')) return number * 1024 * 1024 * 1024 * 1024;
    if (value.endsWith('Pi')) return number * 1024 * 1024 * 1024 * 1024 * 1024;
    if (value.endsWith('Ei')) return number * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;

    return number;
}

export function unparseRam(value) {
    let i = 0;
    while (value >= 1024 && i < RAM_TYPES.length - 1) {
        i++;
        value /= 1024; // eslint-disable-line no-param-reassign
    }

    return {
        value: _.round(value, 1),
        unit: RAM_TYPES[i],
    };
}

export function parseCpu(value) {
    if (!value) return 0;

    const number = parseInt(value, 10);
    if (value.endsWith('n')) return number;
    if (value.endsWith('u')) return number * 1000;
    if (value.endsWith('m')) return number * 1000 * 1000;
    return number * 1000 * 1000 * 1000;
}

export function unparseCpu(value) {
    const result = parseFloat(value);

    return {
        value: _.round(result / 1000000, 2),
        unit: 'm',
    };
}
