import React from 'react';
import Base from '../components/base';
import ChartsContainer from '../components/chartsContainer';
import Filter from '../components/filter';
import api from '../services/api';
import EventsPanel from '../components/eventsPanel';
import NodeStatusChart from '../components/nodeStatusChart';
import test from '../utils/filterHelper';
import {defaultSortInfo, sortByDate} from '../components/sorter';
import PodStatusChart from '../components/podStatusChart';
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import NodeCpuChart from '../components/nodeCpuChart';
import NodeRamChart from '../components/nodeRamChart';
import getMetrics from '../utils/metricsHelpers';

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
            nodeMetrics: api.metrics.nodes(nodeMetrics => this.setState({nodeMetrics})),
        });
    }

    render() {
        const {events, pods, podMetrics, nodes, nodeMetrics, sort, filter} = this.state;
        const filteredEvents = filterEvents(events, filter);
        const filteredPodMetrics = getMetrics(pods, podMetrics);
        const filteredNodeMetrics = getMetrics(nodes, nodeMetrics);

        return (
            <div id='content'>
                <Filter
                    text='Cluster Overview'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                />

                <ChartsContainer>
                    <NodeStatusChart items={nodes} />
                    <NodeCpuChart items={nodes} metrics={filteredNodeMetrics} />
                    <NodeRamChart items={nodes} metrics={filteredNodeMetrics} />
                </ChartsContainer>

                <ChartsContainer>
                    <PodStatusChart items={pods} />
                    <PodCpuChart items={pods} metrics={filteredPodMetrics} />
                    <PodRamChart items={pods} metrics={filteredPodMetrics} />
                </ChartsContainer>

                <div className='contentPanel_header'>Events</div>
                <EventsPanel items={filteredEvents} filter={filter} sort={sort} />
            </div>
        );
    }
}

function filterEvents(events, filter) {
    if (!events) return null;

    return events
        .filter(x => test(filter, x.involvedObject.name, x.reason, x.message))
        .slice(0, 250);
}
