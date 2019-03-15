import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class PersistentVolumeClaims extends Base {
    setNamespace(namespace) {
        this.setState({items: null});

        this.registerApi({
            items: api.persistentVolumeClaim.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, filter = ''} = this.state || {};
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Persistent Volume Claims'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} />
                                <th>Status</th>
                                <th>Class Name</th>
                                <th>Access Modes</th>
                                <th>Volume</th>
                                <th>Capacity</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        includeNamespace={true}
                                        href={`#/persistentvolumeclaim/${x.metadata.namespace}/${x.metadata.name}`}
                                    />
                                    <td>{x.status.phase}</td>
                                    <td>{x.spec.storageClassName}</td>
                                    <td>{x.spec.accessModes.join(' • ')}</td>
                                    <td>{x.spec.volumeName}</td>
                                    <td>{x.status.capacity.storage}</td>
                                </tr>
                            )) : (
                                <NoResults colSpan='9' items={filtered} filter={filter} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
