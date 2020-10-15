import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {Role, ClusterRole} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    roles?: Role[];
    clusterRoles?: ClusterRole[];
}

export default class RolesView extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    componentDidMount() {
        this.registerApi({
            role: api.role.list(undefined, roles => this.setState({roles})),
            clusterRole: api.clusterRole.list(clusterRoles => this.setState({clusterRoles})),
        });
    }

    render() {
        const {roles, clusterRoles, sort, filter} = this.state;

        let items;
        if (roles || clusterRoles) {
            items = [...roles || [], ...clusterRoles || []];
        }

        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Roles'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders sort={sort} includeNamespace={true} />
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan={4} row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    includeNamespace={true}
                                    href={x.kind === 'ClusterRole'
                                        ? `#!clusterrole/${x.metadata.name}`
                                        : `#!role/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}
