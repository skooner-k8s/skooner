import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {parseDiskSpace} from '../utils/unitHelpers';

export default class PersistentVolumeClaims extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({items: null});

        this.registerApi({
            items: api.persistentVolumeClaim.list(namespace, items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
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
                                <MetadataHeaders includeNamespace={true} sort={sort} />
                                <th>
                                    <Sorter field='status.phase' sort={sort}>Status</Sorter>
                                </th>
                                <th>
                                    <Sorter field='spec.storageClassName' sort={sort}>Class Name</Sorter>
                                </th>
                                <th>
                                    <Sorter field={getAccessModes} sort={sort}>Access Modes</Sorter>
                                </th>
                                <th>
                                    <Sorter field='spec.volumeName' sort={sort}>Volume</Sorter>
                                </th>
                                <th>
                                    <Sorter field={getDiskSpace} sort={sort}>Capacity</Sorter>
                                </th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan='9' row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={`#/persistentvolumeclaim/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>{x.status.phase}</td>
                                <td>{x.spec.storageClassName}</td>
                                <td>{getAccessModes(x, ' • ')}</td>
                                <td>{x.spec.volumeName}</td>
                                <td>{x.status.capacity && x.status.capacity.storage}</td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

function getAccessModes({spec}, join = ' ') {
    return spec.accessModes.join(join);
}

function getDiskSpace({status}) {
    return status.capacity && parseDiskSpace(status.capacity.storage);
}
