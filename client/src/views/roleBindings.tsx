import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import {ClusterRole, ClusterRoleBinding} from '../utils/types';

type State = {
    filter: string;
    sort: SortInfo;
    clusterRoles?: ClusterRole[];
    clusterRoleBindings?: ClusterRoleBinding[];
}

export default class RoleBindings extends Base<{}, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    componentDidMount() {
        this.registerApi({
            role: api.roleBinding.list(undefined, x => this.setState({clusterRoles: x})),
            clusterRole: api.clusterRoleBinding.list(x => this.setState({clusterRoleBindings: x})),
        });
    }

    render() {
        const {clusterRoles, clusterRoleBindings, sort, filter} = this.state;

        let items;
        if (clusterRoles || clusterRoleBindings) {
            items = [...clusterRoles || [], ...clusterRoleBindings || []];
        }

        const filtered = items && items.filter(x => test(filter, x.metadata.name));

        return (
            <div id='content'>
                <Filter
                    text='Role Bindings'
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
                                    href={x.kind === 'ClusterRoleBinding'
                                        ? `#!clusterrolebinding/${x.metadata.name}`
                                        : `#!rolebinding/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}
