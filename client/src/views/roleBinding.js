import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import {NoResults, hasResults} from '../components/listViewHelpers';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import ResourceSvg from '../art/resourceSvg';

const service = api.roleBinding;

export default class RoleBinding extends Base {
    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item} = this.state || {};
        const subjects = item && item.subjects;

        return (
            <div id='content'>
                <ItemHeader title={['Role Binding', namespace, name]} item={item}>
                    <>
                        <SaveButton
                            item={item}
                            onSave={x => service.put(x)}
                        />

                        <DeleteButton
                            onDelete={() => service.delete(namespace, name)}
                        />
                    </>
                </ItemHeader>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Role'>
                                <a href={getRoleHref(namespace, item)}>
                                    {item.roleRef.name}
                                </a>
                            </Field>
                        </div>
                    )}
                </div>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <th className='th_icon'></th>
                                <th>Name</th>
                                <th>Namespace</th>
                                <th>Api Group</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(subjects) ? subjects.map(x => (
                                <tr key={x.name}>
                                    <td>
                                        <ResourceSvg resource={x.kind} />
                                        <div className='td_iconLabel'>{x.kind}</div>
                                    </td>
                                    <td>
                                        {x.kind === 'ServiceAccount' ? (<a href={getSubjectHref(x)}>{x.name}</a>) : x.name}
                                    </td>
                                    <td>{x.namespace}</td>
                                    <td>{x.apiGroup}</td>
                                </tr>
                            )) : (
                                <NoResults items={subjects} colSpan='4' />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

function getRoleHref(namespace, item) {
    const {name, kind} = item.roleRef;
    return kind === 'ClusterRole' ? `#/role/${name}` : `#/role/${namespace}/${name}`;
}

function getSubjectHref({name, namespace}) {
    return namespace ? `#/serviceaccount/${namespace}/${name}` : `#/serviceaccount/${name}`;
}
