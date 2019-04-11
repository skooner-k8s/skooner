import './replicaSetsPanel.scss';
import React from 'react';
import Switch from 'react-switch';
import Base from './base';
import Sorter from './sorter';
import {MetadataHeaders, MetadataColumns, TableBody} from './listViewHelpers';

export default class ReplicaSetsPanel extends Base {
    state = {activeOnly: true};

    render() {
        const {items, sort, filter, includeNamespace = true} = this.props;
        const {activeOnly} = this.state;
        const filtered = filterItems(activeOnly, items);

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} includeNamespace={includeNamespace} />
                            <th className='optional_small'>
                                <Sorter field='status.observedGeneration' sort={sort}>Generations</Sorter>
                            </th>
                            <th className='replicaSetsPanel_replicas'>
                                <Sorter field='spec.replicas' sort={sort}>Replicas</Sorter>
                                <label className='replicaSetsPanel_switch optional_xsmall'>
                                    <Switch
                                        checked={activeOnly}
                                        onChange={x => this.setState({activeOnly: x})}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        width={20}
                                        height={10}
                                    />
                                    <div className='replicaSetsPanel_label'>Acitve</div>
                                </label>
                            </th>
                        </tr>
                    </thead>

                    <TableBody
                        items={filtered}
                        filter={filter}
                        sort={sort}
                        colSpan={5 + !!includeNamespace}
                        row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={includeNamespace}
                                    href={`#!replicaset/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td className='optional_small'>{x.status.observedGeneration}</td>
                                <td>{x.spec.replicas} / {x.status.replicas}</td>
                            </tr>
                        )}
                    />
                </table>
            </div>
        );
    }
}

function filterItems(activeOnly, items) {
    if (!items) return null;

    return items.filter(x => !((!x.status.replicas || !x.spec.replicas) && activeOnly));
}
