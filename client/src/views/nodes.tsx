import React from 'react';
import Base from '../components/base';
import ChartsContainer from '../components/chartsContainer';
import Filter from '../components/filter';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import NodeStatusChart from '../components/nodeStatusChart';
import api from '../services/api';
import test from '../utils/filterHelper';
import NodesPanel from '../components/nodesPanel';
import getReadyStatus from '../utils/nodeHelpers';
import NodeCpuChart from '../components/nodeCpuChart';
import NodeRamChart from '../components/nodeRamChart';
import getMetrics from '../utils/metricsHelpers';
import {Node, Metrics, Pod} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    items?: Node[];
    metrics?: Metrics[];
    pods?: Pod[];
};

export default class Nodes extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this, getReadyStatus, 'asc'),
    };

    componentDidMount() {
        this.registerApi({
            items: api.node.list(items => this.setState({items})),
            metrics: api.metrics.nodes(metrics => this.setState({metrics})),
            pods: api.pod.list(undefined, pods => this.setState({pods})),
        });
    }

    render() {
        const {items, metrics, pods, sort, filter} = this.state;

        const filtered = filterNodes(items, filter);
        const filteredMetrics = getMetrics(filtered, metrics);

        return (
            <div id='content'>
                <Filter
                    text='Nodes'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <ChartsContainer>
                    <NodeStatusChart items={filtered} />
                    <NodeCpuChart items={filtered} metrics={filteredMetrics} />
                    <NodeRamChart items={filtered} metrics={filteredMetrics} />
                </ChartsContainer>

                <NodesPanel
                    sort={sort}
                    items={filtered}
                    metrics={filteredMetrics}
                    pods={pods}
                />
            </div>
        );
    }
}

function filterNodes(items?: Node[], filter?: string) {
    if (!items) return undefined;

    return items.filter((x) => {
        const labels = x.metadata.labels || {};
        const searchableLabels = Object.entries(labels).flat();
        return test(filter, x.metadata.name, ...searchableLabels);
    });
}
