import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {defaultSortInfo} from '../components/sorter';
import {MetadataColumns, MetadataHeaders, TableBody} from '../components/listViewHelpers';

export default class ConfigMaps extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({items: null});

        this.registerApi({
            items: api.configMap.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Config Maps'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} sort={sort} />
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} colSpan='4' sort={sort} row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#!configmap/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}
