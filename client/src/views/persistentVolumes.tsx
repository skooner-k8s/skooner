import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo, SortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {parseDiskSpace} from '../utils/unitHelpers';
import {PersistentVolume} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    items?: PersistentVolume[];
}

export default class PersistentVolumes extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    componentDidMount() {
        this.registerApi({
            items: api.persistentVolume.list(items => this.setState({items})),
        });
    }

    render() {
        const {items, sort, filter} = this.state;
        const filtered = items && items.filter(x => test(filter, x.metadata.name));

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
                                <MetadataHeaders sort={sort} />
                                <th className='optional_small'>
                                    <Sorter field='status.phase' sort={sort}>Status</Sorter>
                                </th>
                                <th>
                                    <Sorter field={getDiskSpace} sort={sort}>Capacity</Sorter>
                                </th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan={5} row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    href={`#!persistentvolume/${x.metadata.name}`}
                                />
                                <td className='optional_small'>{x.status.phase}</td>
                                <td>{x.spec.capacity && x.spec.capacity.storage}</td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

function getDiskSpace({spec}: PersistentVolume) {
    return spec.capacity && parseDiskSpace(spec.capacity.storage);
}
