import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class StorageClasses extends Base {
    componentDidMount() {
        this.registerApi({
            items: api.storageClass.list(items => this.setState({items})),
        });
    }

    render() {
        const {items, filter = ''} = this.state || {};
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Storage Classes'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders />
                                <th>Reclaim Policy</th>
                                <th>Mode</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        href={`#/storageclass/${x.metadata.name}`}
                                    />
                                    <td>{x.reclaimPolicy}</td>
                                    <td>{x.volumeBindingMode}</td>
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
