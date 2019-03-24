import _ from 'lodash';

export default function getPodMetrics(pods, metrics) {
    if (!pods || !metrics) return null;

    const names = _.map(pods, x => x.metadata.name);
    const filteredMetrics = metrics.filter(x => names.includes(x.metadata.name));

    return _.keyBy(filteredMetrics, 'metadata.name');
}
