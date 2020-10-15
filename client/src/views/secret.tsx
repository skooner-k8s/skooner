import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import SecretValue from '../components/secretValue';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import {Secret} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    item?: Secret;
}

const service = api.secret;

export default class SecretView extends Base<Props, State> {
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
                <ItemHeader title={['Secret', namespace, name]} ready={!!item}>
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
                            <Field name='Type' value={item.type} />
                        </div>
                    )}
                </div>

                <div className='contentPanel'>
                    {!item ? <Loading /> : Object.entries(item.data || {}).map(([key, value]) => (
                        <Field key={key} name={key}>
                            <SecretValue text={atob(value)} />
                        </Field>
                    ))}
                </div>
            </div>
        );
    }
}
