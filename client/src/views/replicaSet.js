import React from 'react';
import api from '../services/api';
import Base from '../components/base';
import Chart from '../components/chart';
import ContainersPanel from '../components/containersPanel';
import CpuChart from '../components/cpuChart';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import RamChart from '../components/ramChart';
import SaveButton from '../components/saveButton';
import ScaleButton from '../components/scaleButton';
import {defaultSortInfo} from '../components/sorter';
import getPodMetrics from '../utils/metricsHelpers';
import {filterByOwner} from '../utils/filterHelper';

const service = api.replicaSet;

export default class ReplicaSet extends Base {
    state = {
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
        eventsSort: defaultSortInfo(x => this.setState({eventsSort: x})),
    };

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
        const {item, pods, metrics, events, podsSort, eventsSort} = this.state;

        const filteredPods = filterByOwner(pods, item);
        const filteredEvents = filterByOwner(events, item);
        const filteredMetrics = getPodMetrics(filteredPods, metrics);

        return (
            <div id='content'>
                <ItemHeader title={['Replica Set', namespace, name]} item={item}>
                    <>
                        <ScaleButton
                            namespace={namespace}
                            name={name}
                            scaleApi={service.scale}
                        />

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
                            used={item && item.status.readyReplicas}
                            pending={item && item.status.unavailableReplicas}
                            available={item && item.status.replicas}
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
                <PodsPanel items={filteredPods} sort={podsSort} metrics={filteredMetrics} skipNamespace={true} />
                <EventsPanel shortList={true} sort={eventsSort} items={filteredEvents} />
            </div>
        );
    }
}
