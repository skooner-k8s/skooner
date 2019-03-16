import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class PersistentVolumes extends Base {
    componentDidMount() {
        this.registerApi({
            items: api.persistentVolume.list(items => this.setState({items})),
        });
    }

    render() {
        const {items, filter = ''} = this.state || {};
        const filtered = items && _.orderBy(items, 'metadata.name')
            .filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Persistent Volumes'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders />
                                <th>Status</th>
                                <th>Capacity</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        href={`#/persistentvolume/${x.metadata.name}`}
                                    />
                                    <td>{x.status.phase}</td>
                                    <td>{x.spec.capacity && x.spec.capacity.storage}</td>
                                </tr>
                            )) : (
                                <NoResults items={filtered} filter={filter} colSpan='5' />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
