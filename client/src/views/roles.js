import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, NoResults, hasResults} from '../components/listViewHelpers';
import api from '../services/api';
import test from '../utils/filterHelper';

export default class Roles extends Base {
    componentDidMount() {
        this.registerApi({
            role: api.role.list(null, roles => this.setState({roles})),
            clusterRole: api.clusterRole.list(clusterRoles => this.setState({clusterRoles})),
        });
    }

    render() {
        const {roles, clusterRoles, filter = ''} = this.state || {};

        let items;
        if (roles || clusterRoles) {
            items = [...roles || [], ...clusterRoles || []];
        }

        const filtered = items && _.sortBy(items, 'metadata.name').filter(x => test(filter, x.metadata.name));

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
                                <MetadataHeaders includeNamespace={true} />
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(filtered) ? filtered.map(x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        includeNamespace={true}
                                        href={x.kind === 'ClusterRole'
                                            ? `#/clusterrole/${x.metadata.name}`
                                            : `#/role/${x.metadata.namespace}/${x.metadata.name}`}
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
