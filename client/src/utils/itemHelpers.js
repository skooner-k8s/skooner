import _ from 'lodash';

export function getCpuRequestFlag(item) {
    return !_.every(item.spec.containers, x => !x.resources.requests || !x.resources.requests.cpu);
}

export function getRamRequestFlag(item) {
    return !_.every(item.spec.containers, x => !x.resources.requests || !x.resources.requests.memory);
}
