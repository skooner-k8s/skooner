import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import ReplicaSetsPanel from '../components/replicaSetsPanel';
import {defaultSortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class ReplicaSets extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({items: null});

        this.registerApi({
            items: api.replicaSet.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Replica Sets'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                {/* TODO: put charts here */}

                <ReplicaSetsPanel items={filtered} sort={sort} filter={filter} />
            </div>
        );
    }
}
