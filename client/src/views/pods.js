import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import test from '../utils/filterHelper';
import PodsPanel from '../components/podsPanel';
import {defaultSortInfo} from '../components/sorter';

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
        const fixedMetrics = _.keyBy(metrics, 'metadata.name');
        const skipNamespace = !!namespace;

        return (
            <div id='content'>
                <Filter
                    text='Pods'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                {/* TODO: put charts here */}

                <PodsPanel
                    items={filtered}
                    filter={filter}
                    sort={sort}
                    metrics={fixedMetrics}
                    skipNamespace={skipNamespace}
                />
            </div>
        );
    }
}
