import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class Namespaces extends Base {
    componentDidMount() {
        this.registerApi({
            namespaces: api.namespace.list(namespaces => this.setState({namespaces})),
        });
    }

    render() {
        const {namespaces, filter = ''} = this.state || {};
        const filtered = namespaces && namespaces.filter(x => test(filter, x.metadata.name));

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
                                <MetadataHeaders />
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        href={`#/namespace/${x.metadata.name}`}
                                    />
                                    <td>{x.status.phase}</td>
                                </tr>
                            )) : (
                                <NoResults items={filtered} filter={filter} colSpan='4' />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
