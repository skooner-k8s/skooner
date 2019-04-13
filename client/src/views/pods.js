import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import test from '../utils/filterHelper';
import CpuChart from '../components/cpuChart';
import RamChart from '../components/ramChart';
import PodsPanel from '../components/podsPanel';
import PodStatusChart from '../components/podStatusChart';
import {defaultSortInfo} from '../components/sorter';
import getPodMetrics from '../utils/metricsHelpers';
import ChartsContainer from '../components/chartsContainer';

export default class Pods extends Base {
    state = {
        namespace: '',
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({namespace});
        this.setState({items: null});

        this.registerApi({
            items: api.pod.list(namespace, items => this.setState({items})),
            metrics: api.metrics.pods(namespace, metrics => this.setState({metrics})),
        });
    }

    render() {
        const {items, metrics, namespace, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name));
        const filteredMetrics = getPodMetrics(filtered, metrics);

        return (
            <div id='content'>
                <Filter
                    text='Pods'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <ChartsContainer>
                    <PodStatusChart items={filtered} />
                    <CpuChart items={filtered} metrics={filteredMetrics} />
                    <RamChart items={filtered} metrics={filteredMetrics} />
                </ChartsContainer>

                <PodsPanel
                    items={filtered}
                    filter={filter}
                    sort={sort}
                    metrics={filteredMetrics}
                    skipNamespace={!!namespace}
                />
            </div>
        );
    }
}
