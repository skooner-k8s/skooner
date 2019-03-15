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
import {goTo} from '../router';
import SaveButton from '../components/saveButton';
import DeleteButton from '../components/deleteButton';
import EventsPanel from '../components/eventsPanel';
import ContainersPanel from '../components/containersPanel';
import {objectMap} from '../components/listViewHelpers';
import {filterByOwner} from '../utils/filterHelper';
import {parseRam, unparseRam, parseCpu, unparseCpu} from '../utils/unitHelpers';
import Chart from '../components/chart';

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

        const errors = item && item.status.conditions
            .filter(x => !!x.message)
            .map(x => x.message);

        const filteredEvents = filterByOwner(events, item);

        return (
            <div id='content'>
                <ItemHeader title={['Pod', namespace, name]} item={item}>
                    <>
                        <Button title='Logs' className='button button_clear' onClick={() => goTo(`pod/${namespace}/${name}/logs`)}>
                            <LogsSvg />
                            <span className='button_label'>Logs</span>
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

                {errors && <Error messages={errors} />}

                <div className='charts'>
                    <div className='charts_item'>
                        <div>{item && item.spec.containers.length}</div>
                        <div className='charts_itemLabel'>Containers</div>
                    </div>
                    <div className='charts_item'>
                        <Cpu item={item} metrics={metrics} />
                        <div className='charts_itemLabel'>Cpu Used</div>
                    </div>
                    <div className='charts_item'>
                        <Ram item={item} metrics={metrics} />
                        <div className='charts_itemLabel'>Ram Used</div>
                    </div>
                </div>

                <div className='contentPanel'>
                    {!item ? <Loading /> : (
                        <div>
                            <MetadataFields item={item} />
                            <Field name='Owned By'>
                                {_.map(item.metadata.ownerReferences, x => (
                                    <div key={x.uid}>
                                        <a href={`#/${x.kind !== 'ReplicaSet' ? 'workload/' : ''}${x.kind.toLowerCase()}/${namespace}/${x.name}`}>
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
                                        <span>{x.type}</span> • <span>{x.status}</span>
                                    </div>
                                ))}
                            </Field>
                            <Field name='Node Name'>
                                <a href={`#/node/${item.spec.nodeName}`}>
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

function Cpu({item, metrics}) {
    if (!item || !metrics) return null;

    const actual = _.sumBy(metrics.containers, x => parseCpu(x.usage.cpu));
    const podContainers = _.filter(item.spec.containers, x => x.resources && x.resources.requests);
    const requested = _.sumBy(podContainers, x => parseCpu(x.resources.requests.cpu));

    const actualCpu = unparseCpu(actual);
    const requestedCpu = unparseCpu(requested);

    return (
        <Chart
            decimals={2}
            used={actualCpu.value}
            usedSuffix={actualCpu.unit}
            available={requestedCpu.value}
            availableSuffix={requestedCpu.unit}
        />
    );
}

function Ram({item, metrics}) {
    if (!item || !metrics) return null;

    const actual = _.sumBy(metrics.containers, x => parseRam(x.usage.memory));
    const requested = _.sumBy(item.spec.containers, (x) => {
        if (!x.resources.requests) return 0;
        return parseRam(x.resources.requests.memory);
    });

    const actualRam = unparseRam(actual);
    const requestedRam = unparseRam(requested);

    // TODO: this will break if the units don't match
    return (
        <Chart
            decimals={2}
            used={actualRam.value}
            usedSuffix={actualRam.unit}
            available={requestedRam.value}
            availableSuffix={requestedRam.unit}
        />
    );
}
