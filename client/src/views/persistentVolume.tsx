import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import {PersistentVolume} from '../utils/types';

type State = {
    item?: PersistentVolume;
}

type Props = {
    name: string;
}

const service = api.persistentVolume;

export default class PersistentVolumeView extends Base<Props, State> {
    componentDidMount() {
        const {name} = this.props;

        this.registerApi({
            item: service.get(name, item => this.setState({item})),
        });
    }

    render() {
        const {name} = this.props;
        const {item} = this.state || {};

        return (
            <div id='content'>
                <ItemHeader title={['Persistent Volume', name]} ready={!!item}>
                    <>
                        <SaveButton
                            item={item!}
                            onSave={x => service.put(x)}
                        />

                        <DeleteButton
                            onDelete={() => service.delete(name)}
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
                            <Field name='Claim'>
                                {item.spec.claimRef && (
                                    <a href={`#!persistentvolumeclaim/${item.spec.claimRef.namespace}/${item.spec.claimRef.name}`}>
                                        {`${item.spec.claimRef.namespace}/${item.spec.claimRef.name}`}
                                    </a>
                                )}
                            </Field>
                            <Field name='Access Modes' value={item.spec.accessModes && item.spec.accessModes.join(' • ')} />
                            <Field name='Capacity' value={item.spec.capacity && item.spec.capacity.storage} />
                            <Field name='Reclaim Policy' value={item.spec.persistentVolumeReclaimPolicy} />
                            <Field name='Local Path' value={item.spec.local && item.spec.local.path} />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
