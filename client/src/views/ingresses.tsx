import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import {Ingress} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    items?: Ingress[];
}

export default class Ingresses extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace: string) {
        this.setState({items: undefined});

        this.registerApi({
            items: api.ingress.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name, getHosts(x, ' '), getPaths(x, ' ')));

        return (
            <div id='content'>
                <Filter
                    text='Ingresses'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} sort={sort} />
                                <th>Hosts</th>
                                <th className='optional_xsmall'>Paths</th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan={6} row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#!ingress/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>{getHosts(x, ' • ')}</td>
                                <td className='optional_xsmall'>{getPaths(x, ' • ')}</td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

function getHosts({spec}: Ingress, join: string) {
    return _.map(spec.rules, y => y.host)
        .join(join);
}

function getPaths({spec}: Ingress, join: string) {
    return _.flatMap(spec.rules, x => x.http.paths)
        .map(x => x.path)
        .join(join);
}
