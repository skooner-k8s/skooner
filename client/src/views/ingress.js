import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import {NoResults, hasResults} from '../components/listViewHelpers';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';

const service = api.ingress;

export default class Ingress extends Base {
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
                <ItemHeader title={['Ingress', namespace, name]} item={item}>
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
                    <table>
                        <thead>
                            <tr>
                                <th>Host</th>
                                <th>Path</th>
                                <th>Service Name</th>
                                <th>Service Port</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasResults(rules) ? rules.map(rule => (
                                <>
                                {rule.http.paths.map(path => (
                                    <tr key={`${rule.host}:${path.path}`}>
                                        <td>{rule.host}</td>
                                        <td>{path.path}</td>
                                        <td>{path.backend && path.backend.serviceName}</td>
                                        <td>{path.backend && path.backend.servicePort}</td>
                                    </tr>
                                ))}
                                </>
                            )) : (
                                <NoResults colSpan='4' items={rules} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
