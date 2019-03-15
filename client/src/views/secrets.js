import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class Secrets extends Base {
    setNamespace(namespace) {
        this.setState({items: null});

        this.registerApi({
            items: api.secret.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, filter = ''} = this.state || {};
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
                                <MetadataHeaders includeNamespace={true} />
                                <th>Type</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        includeNamespace={true}
                                        href={`#/secret/${x.metadata.namespace}/${x.metadata.name}`}
                                    />
                                    <td>{x.type}</td>
                                </tr>
                            )) : (
                                <NoResults colSpan='5' items={filtered} filter={filter} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
