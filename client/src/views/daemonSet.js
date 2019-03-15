import React from 'react';
import Base from '../components/base';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import api from '../services/api';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import PodsPanel from '../components/podsPanel';
import Chart from '../components/chart';
import RamChart from '../components/ramChart';
import CpuChart from '../components/cpuChart';
import {getPodMetrics} from '../utils/metricsHelpers';
import {filterByOwner} from '../utils/filterHelper';
import ContainersPanel from '../components/containersPanel';

const service = api.daemonSet;

export default class DaemonSet extends Base {
    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
            pods: api.pod.list(namespace, pods => this.setState({pods})),
            events: api.event.list(namespace, events => this.setState({events})),
            metrics: api.metrics.pods(namespace, metrics => this.setState({metrics})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item, pods, events, metrics} = this.state || {};

        const filteredPods = filterByOwner(pods, item);
        const filteredEvents = filterByOwner(events, item);
        const filteredMetrics = getPodMetrics(filteredPods, metrics);

        return (
            <div id='content'>
                <ItemHeader title={['Daemon Set', namespace, name]} item={item}>
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

                <div className='charts'>
                    <div className='charts_item'>
                        <Chart
                            used={item && item.status.numberAvailable}
                            pending={item && item.status.numberUnavailable}
                            available={item && item.status.desiredNumberScheduled}
                        />
                        <div className='charts_itemLabel'>Replicas</div>
                    </div>
                    <CpuChart items={filteredPods} metrics={filteredMetrics} />
                    <RamChart items={filteredPods} metrics={filteredMetrics} />
                </div>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                        </div>
                    )}
                </div>

                <ContainersPanel spec={item && item.spec.template.spec} />
                <PodsPanel items={filteredPods} metrics={filteredMetrics} skipNamespace={true} />
                <EventsPanel shortList={true} items={filteredEvents} />
            </div>
        );
    }
}
