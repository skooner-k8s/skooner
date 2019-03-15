import './replicaSetsPanel.scss';
import React from 'react';
import Switch from 'react-switch';
import Base from './base';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from './listViewHelpers';

export default class ReplicaSetsPanel extends Base {
    render() {
        const {items, filter, includeNamespace = true} = this.props;
        const {activeOnly = true} = this.state || {};
        const filtered = filterItems(activeOnly, items);

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders includeNamespace={includeNamespace} />
                            <th>Generations</th>
                            <th className='replicaSetsPanel_replicas'>
                                Replicas
                                <label className='replicaSetsPanel_checkbox'>
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

                    <tbody>
                        {hasResults(filtered) ? filtered.map(x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={includeNamespace}
                                    href={`#/replicaset/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>{x.status.observedGeneration}</td>
                                <td>{x.spec.replicas} / {x.status.replicas}</td>
                            </tr>
                        )) : (
                            <NoResults
                                colSpan={5 + includeNamespace}
                                items={filtered}
                                filter={filter}
                            />
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

function filterItems(activeOnly, items) {
    if (!items) return null;

    return items.filter(x => !((!x.status.replicas || !x.spec.replicas) && activeOnly));
}
