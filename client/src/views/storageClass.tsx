import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import {StorageClass} from '../utils/types';

type Props = {
    name: string;
}

type State = {
    item?: StorageClass;
}

const service = api.storageClass;

export default class StorageClassView extends Base<Props, State> {
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
                <ItemHeader title={['Storage Class', name]} ready={!!item}>
                    <>
                        <SaveButton
                            item={item}
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
                            <Field name='Provisioner' value={item.provisioner} />
                            <Field name='Policy' value={item.reclaimPolicy} />
                            <Field name='Mode' value={item.volumeBindingMode} />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
