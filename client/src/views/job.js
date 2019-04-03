import React from 'react';
import Base from '../components/base';
import ContainersPanel from '../components/containersPanel';
import CpuChart from '../components/cpuChart';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import Field from '../components/field';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import RamChart from '../components/ramChart';
import SaveButton from '../components/saveButton';
import api from '../services/api';
import getPodMetrics from '../utils/metricsHelpers';
import {filterByOwner} from '../utils/filterHelper';
import {defaultSortInfo} from '../components/sorter';

const service = api.job;

export default class Job extends Base {
    state = {
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
        eventsSort: defaultSortInfo(x => this.setState({eventsSort: x})),
    }

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
                <ItemHeader title={['Job', namespace, name]} item={item}>
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
                        {/* TODO: put a chart here */}
                        <div className='charts_number'>
                            {item && (item.status.active || 0)}
                            <span> / </span>
                            {item && (item.status.succeeded || 0)}
                        </div>
                        <div className='charts_itemLabel'>Active / Succeeded</div>
                    </div>
                    <CpuChart items={filteredPods} metrics={filteredMetrics} />
                    <RamChart items={filteredPods} metrics={filteredMetrics} />
                </div>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Start Time' value={item.status.startTime} />
                            <Field name='Completion Time' value={item.status.completionTime} />
                        </div>
                    )}
                </div>

                <ContainersPanel spec={item && item.spec.template.spec} />

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
