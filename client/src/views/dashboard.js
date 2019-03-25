import React from 'react';
import Base from '../components/base';
import Filter from '../components/filter';
import api from '../services/api';
import EventsPanel from '../components/eventsPanel';
import NodeStatusChart from '../components/nodeStatusChart';
import test from '../utils/filterHelper';
import {defaultSortInfo, sortByDate} from '../components/sorter';
import PodStatusChart from '../components/podStatusChart';
import CpuChart from '../components/cpuChart';
import RamChart from '../components/ramChart';
import getPodMetrics from '../utils/metricsHelpers';

export default class Dashboard extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this, sortByDate),
    };

    componentDidMount() {
        this.registerApi({
            events: api.event.list(null, events => this.setState({events})),
            pods: api.pod.list(null, pods => this.setState({pods})),
            podMetrics: api.metrics.pods(null, podMetrics => this.setState({podMetrics})),
            nodes: api.node.list(nodes => this.setState({nodes})),
        });
    }

    render() {
        const {events, pods, podMetrics, nodes, sort, filter} = this.state;
        const filteredEvents = filterEvents(events, filter);
        const filteredPodMetrics = getPodMetrics(pods, podMetrics);

        return (
            <div id='content'>
                <Filter
                    text='Cluser Overview'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <div className='charts'>
                    <NodeStatusChart items={nodes} />
                    <PodStatusChart items={pods} />
                    <CpuChart items={pods} metrics={filteredPodMetrics} />
                    <RamChart items={pods} metrics={filteredPodMetrics} />
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
        .slice(0, 250);
}
