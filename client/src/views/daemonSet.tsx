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
import LoadingChart from '../components/loadingChart';
import PodRamChart from '../components/podRamChart';
import PodCpuChart from '../components/podCpuChart';
import getMetrics from '../utils/metricsHelpers';
import {filterByOwner} from '../utils/filterHelper';
import ContainersPanel from '../components/containersPanel';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import ChartsContainer from '../components/chartsContainer';
import {DaemonSet, Pod, K8sEvent, Metrics} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    podsSort: SortInfo;
    eventsSort: SortInfo;
    item?: DaemonSet;
    pods?: Pod[];
    events?: K8sEvent[];
    metrics?: Metrics[];
}

const service = api.daemonSet;

export default class DaemonSetView extends Base<Props, State> {
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
                <ItemHeader title={['Daemon Set', namespace, name]} ready={!!item}>
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
                        {item ? (
                            <Chart
                                used={item.status.numberAvailable}
                                pending={item.status.numberUnavailable}
                                available={item.status.desiredNumberScheduled}
                            />
                        ) : (
                            <LoadingChart />
                        )}
                        <div className='charts_itemLabel'>Replicas</div>
                        <div className='charts_itemSubLabel'>Ready vs Requested</div>
                    </div>
                    <PodCpuChart items={filteredPods} metrics={filteredMetrics} />
                    <PodRamChart items={filteredPods} metrics={filteredMetrics} />
                </ChartsContainer>

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
                    sort={eventsSort}
                    shortList={true}
                    items={filteredEvents}
                />
            </div>
        );
    }
}
