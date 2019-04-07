import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Button from '../components/button';
import Error from '../components/error';
import ItemHeader from '../components/itemHeader';
import Loading from '../components/loading';
import MetadataFields from '../components/metadataFields';
import Field from '../components/field';
import api from '../services/api';
import LogsSvg from '../art/logsSvg';
import ExecSvg from '../art/execSvg';
import {goTo} from '../router';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import ContainersPanel from '../components/containersPanel';
import {objectMap} from '../components/listViewHelpers';
import {filterByOwner} from '../utils/filterHelper';
import getPodMetrics from '../utils/metricsHelpers';
import CpuChart from '../components/cpuChart';
import RamChart from '../components/ramChart';

const service = api.pod;

export default class Pod extends Base {
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
        const filteredMetrics = getPodMetrics(item && [item], metrics && [metrics]);

        return (
            <div id='content'>
                <ItemHeader title={['Pod', namespace, name]} ready={!!item}>
                    <>
                        <Button title='Logs' className='button_headerAction' onClick={() => goTo(`pod/${namespace}/${name}/logs`)}>
                            <LogsSvg />
                            <span className='button_label'>Logs</span>
                        </Button>

                        <Button title='Exec' className='button_headerAction' onClick={() => goTo(`pod/${namespace}/${name}/exec`)}>
                            <ExecSvg />
                            <span className='button_label'>Exec</span>
                        </Button>

                        <SaveButton
                            item={item}
                            onSave={x => service.put(x)}
                        />

                        <DeleteButton
                            onDelete={() => service.delete(namespace, name)}
                        />
                    </>
                </ItemHeader>

                {errors && !!errors.length && <Error messages={errors} />}

                <div className='charts'>
                    <div className='charts_item'>
                        <div className='charts_number'>{item && item.spec.containers.length}</div>
                        <div className='charts_itemLabel'>Containers</div>
                    </div>
                    <CpuChart items={item && [item]} metrics={filteredMetrics} />
                    <RamChart items={item && [item]} metrics={filteredMetrics} />
                </div>

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
                <EventsPanel items={filteredEvents} />
            </div>
        );
    }
}

function getErrors(item) {
    if (!item) return [];
    if (item.status.message) return [item.status.message];
    if (item.status.conditions) return item.status.conditions.map(x => x.message).filter(x => !!x);

    return null;
}
