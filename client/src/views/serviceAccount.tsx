import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import {ServiceAccount} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    item?: ServiceAccount;
}

const service = api.serviceAccount;

export default class ServiceAccountView extends Base<Props, State> {
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
                <ItemHeader title={['Service Account', namespace, name]} ready={!!item}>
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
                            <Field name='Secrets'>
                                {_.map(item.secrets, x => (
                                    <div key={x.name}>
                                        <a href={`#!secret/${namespace}/${x.name}`}>{x.name}</a>
                                    </div>
                                ))}
                            </Field>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
