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
import {ConfigMap} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    item?: ConfigMap;
}

const service = api.configMap;

export default class ConfigMapView extends Base<Props, State> {
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
                <ItemHeader title={['Config Map', namespace, name]} ready={!!item}>
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
                        </div>
                    )}
                </div>

                <div className='contentPanel'>
                    {!item ? <Loading /> : _.map(item.data, (value, key) => (
                        <Field key={key} name={key} value={value} />
                    ))}
                </div>
            </div>
        );
    }
}
