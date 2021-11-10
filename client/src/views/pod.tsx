import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Error from '../components/error';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import Field from '../components/field';
import api from '../services/api';
import LogsSvg from '../art/logsSvg';
import ExecSvg from '../art/execSvg';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import ContainersPanel from '../components/containersPanel';
import {objectMap} from '../components/listViewHelpers';
import {filterByOwner} from '../utils/filterHelper';
import getMetrics from '../utils/metricsHelpers';
import PodCpuChart from '../components/podCpuChart';
import PodRamChart from '../components/podRamChart';
import ChartsContainer from '../components/chartsContainer';
import {Pod, Metrics, K8sEvent} from '../utils/types';

type Props = {
    namespace: string;
    name: string;
}

type State = {
    item?: Pod;
    metrics?: Metrics[];
    events?: K8sEvent[];
}

const service = api.pod;

export default class PodView extends Base<Props, State> {
    componentDidMount() {
        const {namespace, name} = this.props;

        this.registerApi({
            item: service.get(namespace, name, item => this.setState({item})),
            metrics: api.metrics.pod(namespace, name, metrics => this.setState({metrics})),
            events: api.event.list(namespace, events => this.setState({events})),
        });
    }

    render() {
        const {namespace, name} = this.props;
        const {item, metrics, events} = this.state || {};

        const errors = getErrors(item);
        const filteredEvents = filterByOwner(events, item);
        // @ts-ignore
        const filteredMetrics = getMetrics(item && [item], metrics && [metrics]);

        return (
            <div id='content'>
                <ItemHeader title={['Pod', namespace, name]} ready={!!item}>
                    <>
                        <a title='Logs' className='button_headerAction' href={`#!pod/${namespace}/${name}/logs`}>
                            <LogsSvg />
                            <span className='button_label'>Logs</span>
                        </a>

                        <a title='Exec' className='button_headerAction' href={`#!pod/${namespace}/${name}/exec`}>
                            <ExecSvg />
                            <span className='button_label'>Exec</span>
                        </a>

                        <SaveButton
                            item={item!}
                            onSave={x => service.put(x)}
                        />

                        <DeleteButton
                            onDelete={() => service.delete(namespace, name)}
                        />
                    </>
                </ItemHeader>

                {errors && !!errors.length && <Error messages={errors} />}

                <ChartsContainer>
                    <PodCpuChart items={item && [item]} metrics={filteredMetrics} />
                    <PodRamChart items={item && [item]} metrics={filteredMetrics} />
                </ChartsContainer>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Owned By'>
                                {_.map(item.metadata.ownerReferences, x => (
                                    <div key={x.uid}>
                                        <a href={`#!${x.kind !== 'ReplicaSet' ? 'workload/' : ''}${x.kind.toLowerCase()}/${namespace}/${x.name}`}>
                                            {`${x.kind.toLowerCase()}/${namespace}/${x.name}`}
                                        </a>
                                    </div>
                                ))}
                            </Field>
                            <Field name='Host IP'>{item.status.hostIP}</Field>
                            <Field name='Pod IP'>{item.status.podIP}</Field>
                            <Field name='QOS'>{item.status.qosClass}</Field>
                            <Field name='Phase'>{item.status.phase}</Field>
                            <Field name='Conditions'>
                                {_.map(item.status.conditions, x => (
                                    <div key={x.type}>
                                        <span>
                                            {
                                                [x.type, x.status, x.message]
                                                    .filter(y => !!y)
                                                    .join(' • ')
                                            }
                                        </span>
                                    </div>
                                ))}
                            </Field>
                            <Field name='Node Name'>
                                <a href={`#!node/${item.spec.nodeName}`}>
                                    {item.spec.nodeName}
                                </a>
                            </Field>
                            <Field name='Selector'>{objectMap(item.spec.nodeSelector)}</Field>
                        </div>
                    )}
                </div>

                <ContainersPanel spec={item && item.spec} />

                <div className='contentPanel_header'>Events</div>
                <EventsPanel
                    shortList={true}
                    items={filteredEvents}
                />
            </div>
        );
    }
}

function getErrors(item?: Pod) {
    if (!item) return [];
    if (item.status && item.status.message) return [item.status.message];
    if (item.status && item.status.conditions) return item.status.conditions.map(x => x.message).filter(x => !!x);

    return undefined;
}
