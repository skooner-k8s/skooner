import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import EventsPanel from '../components/eventsPanel';
import test from '../utils/filterHelper';
import {defaultSortInfo, sortByDate} from '../components/sorter';

export default class Dashboard extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this, sortByDate),
    };

    componentDidMount() {
        this.registerApi({
            events: api.event.list(null, events => this.setState({events})),
            pods: api.pod.list(null, pods => this.setState({pods})),
            nodes: api.node.list(nodes => this.setState({nodes})),
        });
    }

    render() {
        const {events, nodes, pods, sort, filter} = this.state;
        const filteredEvents = filterEvents(events, filter);

        return (
            <div id='content'>
                <Filter
                    text='Cluser Overview'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='charts'>
                    <div className='charts_item'>
                        <div>{nodes && nodes.length}</div>
                        <div className='charts_itemLabel'>Total Nodes</div>
                    </div>
                    <div className='charts_item'>
                        <div>{pods && pods.length}</div>
                        <div className='charts_itemLabel'>Total Pods</div>
                    </div>
                </div>

                <EventsPanel items={filteredEvents} filter={filter} sort={sort} />
            </div>
        );
    }
}

function filterEvents(events, filter) {
    if (!events) return null;

    return events
        .filter(x => test(filter, x.involvedObject.name, x.involvedObject.namespace, x.message))
        .slice(0, 1000);
}
