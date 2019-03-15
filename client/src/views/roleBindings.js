import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class RoleBindings extends Base {
    componentDidMount() {
        this.registerApi({
            role: api.roleBinding.list(null, x => this.setState({clusterRoles: x})),
            clusterRole: api.clusterRoleBinding.list(x => this.setState({clusterRoleBindings: x})),
        });
    }

    render() {
        const {clusterRoles, clusterRoleBindings, filter = ''} = this.state || {};

        let items;
        if (clusterRoles || clusterRoleBindings) {
            items = [...clusterRoles || [], ...clusterRoleBindings || []];
        }

        const filtered = items && _.sortBy(items, 'metadata.name').filter(x => test(filter, x.metadata.name));

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
                                <MetadataHeaders includeNamespace={true} />
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        includeNamespace={true}
                                        href={x.kind === 'ClusterRoleBinding'
                                            ? `#/clusterrolebinding/${x.metadata.name}`
                                            : `#/rolebinding/${x.metadata.namespace}/${x.metadata.name}`}
                                    />
                                </tr>
                            )) : (
                                <NoResults items={filtered} filter={filter} colSpan='4' />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
