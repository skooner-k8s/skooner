import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo, SortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {Secret} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    items?: Secret[];
}

export default class Secrets extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace: string) {
        this.setState({items: undefined});

        this.registerApi({
            items: api.secret.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Secrets'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders sort={sort} includeNamespace={true} />
                                <th><Sorter field='type' sort={sort}>Type</Sorter></th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan={5} row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#!secret/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>{x.type}</td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}
