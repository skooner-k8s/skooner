import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo, SortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {Namespace} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    items?: Namespace[];
}

export default class Namespaces extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    componentDidMount() {
        this.registerApi({
            items: api.namespace.list(items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Namespaces'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders sort={sort} />
                                <th>
                                    <Sorter field='status.phase' sort={sort}>Status</Sorter>
                                </th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} colSpan={4} sort={sort} row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    href={`#!namespace/${x.metadata.name}`}
                                />
                                <td>{x.status.phase}</td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}
