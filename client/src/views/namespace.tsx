import React from 'react';
import Base from '../components/base';
import api from '../services/api';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import Field from '../components/field';
import MetadataFields from '../components/metadataFields';
import DeleteButton from '../components/deleteButton';
import PodsPanel from '../components/podsPanel';
import EventsPanel from '../components/eventsPanel';
import {defaultSortInfo, SortInfo} from '../components/sorter';
import ChartsContainer from '../components/chartsContainer';
import PodStatusChart from '../components/podStatusChart';
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import getMetrics from '../utils/metricsHelpers';
import {Namespace, K8sEvent, Pod, Metrics} from '../utils/types';

type Props = {
    namespace: string;
}

type State = {
    podsSort: SortInfo;
    item?: Namespace;
    events?: K8sEvent[];
    pods?: Pod[];
    podMetrics?: Metrics[];
}

const service = api.namespace;

export default class NamespaceView extends Base<Props, State> {
    state:State = {
        podsSort: defaultSortInfo(x => this.setState({podsSort: x})),
    };

    componentDidMount() {
        const {namespace} = this.props;

        this.registerApi({
            item: service.get(namespace, item => this.setState({item})),
            events: api.event.list(namespace, events => this.setState({events})),
            pods: api.pod.list(namespace, pods => this.setState({pods})),
            podMetrics: api.metrics.pods(namespace, podMetrics => this.setState({podMetrics})),
        });
    }

    render() {
        const {namespace} = this.props;
        const {item, events, pods, podMetrics, podsSort} = this.state;

        const filteredPodMetrics = getMetrics(pods, podMetrics);

        return (
            <div id='content'>
                <ItemHeader title={['Namespace', namespace]} ready={!!item}>
                    <>
                        <DeleteButton
                            onDelete={() => service.delete(namespace)}
                        />
                    </>
                </ItemHeader>

                <ChartsContainer>
                    <PodStatusChart items={pods} />
                    <PodCpuChart items={pods} metrics={filteredPodMetrics} />
                    <PodRamChart items={pods} metrics={filteredPodMetrics} />
                </ChartsContainer>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Status' value={item.status.phase} />
                        </div>
                    )}
                </div>

                <div className='contentPanel_header'>Pods</div>
                <PodsPanel
                    items={pods}
                    sort={podsSort}
                    metrics={filteredPodMetrics}
                    skipNamespace={true}
                />

                <div className='contentPanel_header'>Events</div>

                {/*
                // @ts-ignore */}
                <EventsPanel items={events} />
            </div>
        );
    }
}
