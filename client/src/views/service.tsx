import _ from 'lodash';
import React from 'react';
import api from '../services/api';
import EventsPanel from '../components/eventsPanel';
import Base from '../components/base';
import DeleteButton from '../components/deleteButton';
import Field from '../components/field';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import SaveButton from '../components/saveButton';
import {filterByOwner} from '../utils/filterHelper';
import {Service, K8sEvent} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    item?: Service;
    events?: K8sEvent[];
}

const {service} = api;

export default class ServiceView extends Base<Props, State> {
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

        const filteredEvents = filterByOwner(events, item);

        return (
            <div id='content'>
                <ItemHeader title={['Service', namespace, name]} ready={!!item}>
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
                                {_.map(item.spec.ports, x => (
                                    <div key={x.port}>
                                        {[x.name, x.port, x.targetPort, x.protocol].filter(y => !!y).join(' • ')}
                                    </div>
                                ))}
                            </Field>
                        </div>
                    )}
                </div>

                <div className='contentPanel_header'>Events</div>
                <EventsPanel shortList={true} items={filteredEvents} />
            </div>
        );
    }
}
