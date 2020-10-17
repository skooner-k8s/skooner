import _ from 'lodash';
import React, {Fragment} from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import {TableBody} from '../components/listViewHelpers';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import {Ingress} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    item?: Ingress;
}

const service = api.ingress;

export default class IngressView extends Base<Props, State> {
    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item} = this.state || {};
        const rules = item && item.spec.rules;

        return (
            <div id='content'>
                <ItemHeader title={['Ingress', namespace, name]} ready={!!item}>
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

                <div className='contentPanel_header'>Rules</div>
                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <th>Host</th>
                                <th>Path</th>
                                <th>Service Name</th>
                                <th>Service Port</th>
                            </tr>
                        </thead>

                        <TableBody items={rules} colSpan={4} row={rule => (
                            <Fragment key={rule.host}>
                                {_.map(rule.http.paths, path => (
                                    <tr key={`${rule.host}:${path.path}`}>
                                        <td>{rule.host}</td>
                                        <td>{path.path}</td>
                                        <td>{path.backend && path.backend.serviceName}</td>
                                        <td>{path.backend && path.backend.servicePort}</td>
                                    </tr>
                                ))}
                            </Fragment>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}
