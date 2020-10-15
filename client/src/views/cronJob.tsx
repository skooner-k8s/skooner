import React from 'react';
import Base from '../components/base';
import ContainersPanel from '../components/containersPanel';
import PodCpuChart from '../components/podCpuChart';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import Field from '../components/field';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import PodsPanel from '../components/podsPanel';
import PodRamChart from '../components/podRamChart';
import SaveButton from '../components/saveButton';
import api from '../services/api';
import getMetrics from '../utils/metricsHelpers';
import {filterByOwner} from '../utils/filterHelper';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import ChartsContainer from '../components/chartsContainer';
import {Pod, K8sEvent, Metrics, CronJob} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    podsSort: SortInfo;
    eventsSort: SortInfo;
    item?: CronJob;
    pods?: Pod[];
    events?: K8sEvent[];
    metrics?: Metrics[];
}

const service = api.cronJob;

export default class CronJobView extends Base<Props, State> {
    state: State = {
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
        const filteredMetrics = getMetrics(filteredPods, metrics);

        return (
            <div id='content'>
                <ItemHeader title={['Cron Job', namespace, name]} ready={!!item}>
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

                <ChartsContainer>
                    <div className='charts_item'>
                        <div className='charts_number'>{(item && item.status.active) ? item.status.active.length : 0}</div>
                        <div className='charts_itemLabel'>Active</div>
                    </div>
                    <PodCpuChart items={filteredPods} metrics={filteredMetrics} />
                    <PodRamChart items={filteredPods} metrics={filteredMetrics} />
                </ChartsContainer>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Schedule' value={item.spec.schedule} />
                            <Field name='Suspend' value={item.spec.suspend} />
                            <Field name='Last Scheduled' value={item.status.lastScheduleTime} />
                        </div>
                    )}
                </div>

                <ContainersPanel spec={item && item.spec.jobTemplate.spec.template.spec} />

                {/* TODO: this actually need to be a list of jobs */}

                <div className='contentPanel_header'>Pods</div>
                <PodsPanel
                    items={filteredPods}
                    sort={podsSort}
                    metrics={filteredMetrics}
                    skipNamespace={true}
                />

                <div className='contentPanel_header'>Events</div>
                <EventsPanel
                    sort={eventsSort}
                    shortList={true}
                    items={filteredEvents}
                />
            </div>
        );
    }
}
