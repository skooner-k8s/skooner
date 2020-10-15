import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import {PersistentVolumeClaim} from '../utils/types';

type State = {
    item?: PersistentVolumeClaim;
}

type Props = {
    namespace: string;
    name: string;
}

const service = api.persistentVolumeClaim;

export default class PersistentVolumeClaimView extends Base<Props, State> {
    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item} = this.state || {};

        return (
            <div id='content'>
                <ItemHeader title={['Volume Claim', namespace, name]} ready={!!item}>
                    <>
                        <SaveButton
                            item={item!}
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
                            <Field name='Status' value={item.status.phase} />
                            <Field name='Class'>
                                <a href={`#!storageclass/${item.spec.storageClassName}`}>
                                    {item.spec.storageClassName}
                                </a>
                            </Field>
                            <Field name='Volume'>
                                <a href={`#!persistentvolume/${item.spec.volumeName}`}>
                                    {item.spec.volumeName}
                                </a>
                            </Field>
                            <Field name='Modes' value={item.spec.accessModes.join(' • ')} />
                            <Field name='Capacity' value={item.status.capacity && item.status.capacity.storage} />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
