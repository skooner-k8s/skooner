import React from 'react';
import api from '../services/api';
import EventsPanel from '../components/eventsPanel';
import {NoResults, hasResults} from '../components/listViewHelpers';
import Base from '../components/base';
import DeleteButton from '../components/deleteButton';
import Field from '../components/field';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import SaveButton from '../components/saveButton';
import {filterByOwner} from '../utils/filterHelper';

const {service} = api;

export default class Service extends Base {
    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
            events: api.event.list(namespace, events => this.setState({events})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item, events} = this.state || {};
        const ports = item && item.spec.ports;

        const filteredEvents = filterByOwner(events, item);

        return (
            <div id='content'>
                <ItemHeader title={['Service', namespace, name]} item={item}>
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
                            <Field name='Cluster IP' value={item.spec.clusterIP} />
                            <Field name='Type' value={item.spec.type} />
                            <Field name='Affinity' value={item.spec.sessionAffinity} />
                            <Field name='Selector' value={item.spec.selector && item.spec.selector.app} />
                            <Field name='Ports'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Port</th>
                                            <th>Protocol</th>
                                            <th>Target</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {hasResults(ports) ? item.spec.ports.map(x => (
                                            <tr key={x.port}>
                                                <td>{x.name}</td>
                                                <td>{x.port}</td>
                                                <td>{x.protocol}</td>
                                                <td>{x.targetPort}</td>
                                            </tr>
                                        )) : (
                                            <NoResults colSpan='4' items={ports} />
                                        )}
                                    </tbody>
                                </table>
                            </Field>
                        </div>
                    )}
                </div>

                <EventsPanel shortList={true} items={filteredEvents} />
            </div>
        );
    }
}
