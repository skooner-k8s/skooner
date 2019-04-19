import _ from 'lodash';

export default function getMetrics(items, metrics) {
    if (!items || !metrics) return null;

    const names = _.map(items, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}
