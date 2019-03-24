import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Chart from '../components/chart';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import Working from '../components/working';

export default class Workloads extends Base {
    state = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace) {
        this.setState({
            cronJobs: null,
            daemonSets: null,
            deployments: null,
            jobs: null,
            statefulSets: null,
        });

        this.registerApi({
            cronJobs: api.cronJob.list(namespace, x => this.setState({cronJobs: x})),
            daemonSets: api.daemonSet.list(namespace, x => this.setState({daemonSets: x})),
            deployments: api.deployment.list(namespace, x => this.setState({deployments: x})),
            jobs: api.job.list(namespace, x => this.setState({jobs: x})),
            statefulSets: api.statefulSet.list(namespace, x => this.setState({statefulSets: x})),
        });
    }

    sort(sortBy, sortDirection) {
        this.setState({sortBy, sortDirection});
    }

    render() {
        const {cronJobs, daemonSets, deployments, jobs, statefulSets, sort, filter} = this.state;
        const items = [cronJobs, daemonSets, deployments, jobs, statefulSets];

        const filtered = filterControllers(filter, items);

        const controllerCount = filtered && filtered.length;
        const pendingControllerCount = getPendingControllerCount(filtered);

        const currentPodCount = _.sumBy(filtered, getCurrentCount);
        const expectedPodCount = _.sumBy(filtered, getExpectedCount);

        return (
            <div id='content'>
                <Filter
                    text='Workloads'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <div className='charts'>
                    <div className='charts_item'>
                        <Chart
                            used={controllerCount - pendingControllerCount}
                            pending={pendingControllerCount}
                            available={controllerCount}
                        />
                        <div className='charts_itemLabel'>Controllers</div>
                    </div>
                    <div className='charts_item'>
                        <Chart
                            used={currentPodCount}
                            pending={expectedPodCount - currentPodCount}
                            available={expectedPodCount}
                        />
                        <div className='charts_itemLabel'>Pods</div>
                    </div>
                </div>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders sort={sort}/>
                                <th><Sorter field={getExpectedCount} sort={sort}>Pods</Sorter></th>
                            </tr>
                        </thead>

                        <TableBody items={filtered} filter={filter} sort={sort} colSpan='4' row={x => (
                            <tr key={x.metadata.uid}>
                                <MetadataColumns
                                    item={x}
                                    href={`#/workload/${x.kind.toLowerCase()}/${x.metadata.namespace}/${x.metadata.name}`}
                                />
                                <td>
                                    <Status item={x} />
                                </td>
                            </tr>
                        )} />
                    </table>
                </div>
            </div>
        );
    }
}

function Status({item}) {
    const current = getCurrentCount(item);
    const expected = getExpectedCount(item);
    const text = `${current} / ${expected}`;

    return (current === expected) ? (<span>{text}</span>) : <Working className='contentPanel_warn' text={text} />;
}

function getPendingControllerCount(items) {
    const workingItems = _.filter(items, (item) => {
        const current = getCurrentCount(item);
        const expected = getExpectedCount(item);
        return current !== expected;
    });

    return workingItems.length;
}

function getCurrentCount({status}) {
    return status.readyReplicas || status.numberReady || 0;
}

function getExpectedCount({spec, status}) {
    return spec.replicas || status.currentNumberScheduled || 0;
}

function filterControllers(filter, items) {
    const results = items.flat();

    if (results.length && items.some(x => !x)) return null;

    return _(results)
        .flatten()
        .filter(x => test(filter, x.metadata.name))
        .value();
}
