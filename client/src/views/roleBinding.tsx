import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import {TableBody} from '../components/listViewHelpers';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import Sorter, {defaultSortInfo, SortInfo} from '../components/sorter';
import ResourceSvg from '../art/resourceSvg';
import {RoleBinding, RoleBindingSubject} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    sort: SortInfo;
    item?: RoleBinding;
}

const service = api.roleBinding;

export default class RoleBindingView extends Base<Props, State> {
    state: State = {
        sort: defaultSortInfo(this),
    };

    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item, sort} = this.state || {};
        const subjects = item && item.subjects;

        return (
            <div id='content'>
                <ItemHeader title={['Role Binding', namespace, name]} ready={!!item}>
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

                <div className='contentPanel_header'>Subjects</div>
                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <th className='th_icon optional_small'>
                                    <Sorter field='kind' sort={sort}>Type</Sorter>
                                </th>
                                <th><Sorter field='name' sort={sort}>Name</Sorter></th>
                                <th className='optional_small'><Sorter field='namespace' sort={sort}>Namespace</Sorter></th>
                                <th className='optional_small'><Sorter field='apiGroup' sort={sort}>Api Group</Sorter></th>
                            </tr>
                        </thead>

                        <TableBody items={subjects} sort={sort} colSpan={4} row={x => (
                            <tr key={x.name}>
                                <td className='td_icon optional_small'>
                                    <ResourceSvg resource={x.kind} />
                                    <div className='td_iconLabel'>{x.kind}</div>
                                </td>
                                <td>
                                    {x.kind === 'ServiceAccount' ? (<a href={getSubjectHref(x)}>{x.name}</a>) : x.name}
                                </td>
                                <td className='optional_small'>{x.namespace}</td>
                                <td className='optional_small'>{x.apiGroup}</td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

function getRoleHref(namespace: string, item: RoleBinding) {
    const {name, kind} = item.roleRef;
    return kind === 'ClusterRole' ? `#!role/${name}` : `#!role/${namespace}/${name}`;
}

function getSubjectHref({name, namespace}: RoleBindingSubject) {
    return namespace ? `#!serviceaccount/${namespace}/${name}` : `#!serviceaccount/${name}`;
}
