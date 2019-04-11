import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';

const service = api.namespace;

export default class Namespace extends Base {
    componentDidMount() {
        const {namespace} = this.props;

        this.registerApi({
            item: service.get(namespace, item => this.setState({item})),
            events: api.event.list(namespace, events => this.setState({events})),
        });
    }

    render() {
        const {namespace} = this.props;
        const {item, events} = this.state || {};

        return (
            <div id='content'>
                <ItemHeader title={['Namespace', namespace]} ready={!!item}>
                    <>
                        <DeleteButton
                            onDelete={() => service.delete(namespace)}
                        />
                    </>
                </ItemHeader>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Status' value={item.status.phase} />
                        </div>
                    )}
                </div>

                <div className='contentPanel_header'>Events</div>
                <EventsPanel items={events} />
            </div>
        );
    }
}
