import React from 'react';
import Base from '../components/base';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import api from '../services/api';
import ScaleButton from '../components/scaleButton';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import RamChart from '../components/ramChart';
import CpuChart from '../components/cpuChart';
import getPodMetrics from '../utils/metricsHelpers';
import {filterByOwner} from '../utils/filterHelper';
import ContainersPanel from '../components/containersPanel';
import {defaultSortInfo} from '../components/sorter';
import ReplicasChart from '../components/replicasChart';

const service = api.statefulSet;

export default class StatefulSet extends Base {
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
        const {item, pods, events, metrics, podsSort, eventsSort} = this.state;

        const filteredPods = filterByOwner(pods, item);
        const filteredEvents = filterByOwner(events, item);
        const filteredMetrics = getPodMetrics(filteredPods, metrics);

        return (
            <div id='content'>
                <ItemHeader title={['Stateful Set', namespace, name]} ready={!!item}>
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

                <div className='contentPanel_header'>Pods</div>
                <PodsPanel
                    items={filteredPods}
                    sort={podsSort}
                    metrics={filteredMetrics}
                    skipNamespace={true}
                />

                <div className='contentPanel_header'>Events</div>
                <EventsPanel
                    shortList={true}
                    sort={eventsSort}
                    items={filteredEvents}
                />
            </div>
        );
    }
}
