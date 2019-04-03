import React from 'react';
import Base from '../components/base';
import ContainersPanel from '../components/containersPanel';
import CpuChart from '../components/cpuChart';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import RamChart from '../components/ramChart';
import ReplicaSetsPanel from '../components/replicaSetsPanel';
import SaveButton from '../components/saveButton';
import ScaleButton from '../components/scaleButton';
import api from '../services/api';
import {filterByOwner, filterByOwners} from '../utils/filterHelper';
import getPodMetrics from '../utils/metricsHelpers';
import {defaultSortInfo} from '../components/sorter';
import ReplicasChart from '../components/replicasChart';

const service = api.deployment;

export default class Deployment extends Base {
    state = {
        replicaSetsSort: defaultSortInfo(x => this.setState({replicaSetsSort: x})),
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
        eventsSort: defaultSortInfo(x => this.setState({eventsSort: x})),
    };

    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, x => this.setState({item: x})),
            replicaSets: api.replicaSet.list(namespace, x => this.setState({replicaSets: x})),
            events: api.event.list(namespace, x => this.setState({events: x})),
            pods: api.pod.list(namespace, x => this.setState({pods: x})),
            metrics: api.metrics.pods(namespace, x => this.setState({metrics: x})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {
            item,
            events,
            replicaSets,
            pods,
            metrics,
            replicaSetsSort,
            podsSort,
            eventsSort,
        } = this.state;

        const filteredEvents = filterByOwner(events, item);
        const filteredReplicaSets = filterByOwner(replicaSets, item);
        const filteredPods = filterByOwners(pods, filteredReplicaSets);
        const filteredMetrics = getPodMetrics(filteredPods, metrics);

        return (
            <div id='content'>
                <ItemHeader title={['Deployment', namespace, name]} item={item}>
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
                    <ReplicasChart item={item} />
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

                <ReplicaSetsPanel
                    items={filteredReplicaSets}
                    sort={replicaSetsSort}
                    includeNamespace={false}
                />

                <PodsPanel
                    items={filteredPods}
                    sort={podsSort}
                    metrics={filteredMetrics}
                    skipNamespace={true}
                />

                <EventsPanel
                    shortList={true}
                    sort={eventsSort}
                    items={filteredEvents}
                />
            </div>
        );
    }
}
