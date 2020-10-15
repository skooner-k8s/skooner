import _ from 'lodash';
import React from 'react';
import Base from '../components/base';
import Chart from '../components/chart';
import Filter from '../components/filter';
import {MetadataHeaders, MetadataColumns, TableBody} from '../components/listViewHelpers';
import Sorter, {defaultSortInfo, SortInfo} from '../components/sorter';
import api from '../services/api';
import test from '../utils/filterHelper';
import Working from '../components/working';
import LoadingChart from '../components/loadingChart';
import ChartsContainer from '../components/chartsContainer';
import {ApiItem, CronJob, DaemonSet, Deployment, Job, StatefulSet, TODO} from '../utils/types';

type Props = {

}

type State = {
    filter: string;
    sort: SortInfo;
    cronJobs?: CronJob[] | null;
    daemonSets?: DaemonSet[] | null;
    deployments?: Deployment[] | null;
    jobs?: Job[] | null;
    statefulSets?: StatefulSet[] | null;
    sortBy?: string;
    sortDirection?: string;
}

export default class Workloads extends Base<Props, State> {
    state: State = {
        filter: '',
        sort: defaultSortInfo(this),
    };

    setNamespace(namespace: string) {
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

    sort(sortBy: string, sortDirection: string) {
        this.setState({sortBy, sortDirection});
    }

    render() {
        const {cronJobs, daemonSets, deployments, jobs, statefulSets, sort, filter} = this.state;
        const items = [cronJobs, daemonSets, deployments, jobs, statefulSets];

        const filtered = filterControllers(filter, items);

        return (
            <div id='content'>
                <Filter
                    text='Workloads'
                    filter={filter}
                    onChange={x => this.setState({filter: x})}
                    onNamespaceChange={x => this.setNamespace(x)}
                />

                <ChartsContainer>
                    <ControllerStatusChart items={filtered} />
                    <PodStatusChart items={filtered} />
                </ChartsContainer>

                <div className='contentPanel'>
                    <table>
                        <thead>
                            <tr>
                                <MetadataHeaders includeNamespace={true} sort={sort}/>
                                <th><Sorter field={getExpectedCount} sort={sort}>Pods</Sorter></th>
                            </tr>
                        </thead>

                        <TableBody
                            items={filtered}
                            filter={filter}
                            sort={sort}
                            colSpan={5}
                            row={x => (
                                <tr key={x.metadata.uid}>
                                    <MetadataColumns
                                        item={x}
                                        includeNamespace={true}
                                        href={`#!workload/${x.kind.toLowerCase()}/${x.metadata.namespace}/${x.metadata.name}`}
                                    />
                                    <td>
                                        <Status item={x} />
                                    </td>
                                </tr>
                            )}
                        />
                    </table>
                </div>
            </div>
        );
    }
}

function ControllerStatusChart({items}: {items: ApiItem<any, any>[] | null}) {
    const workingItems = _.filter(items, (item) => {
        const current = getCurrentCount(item);
        const expected = getExpectedCount(item);
        return current !== expected;
    });

    const count = items && items.length;
    const pending = workingItems.length;

    return (
        <div className='charts_item'>
            {items && count != null && pending != null ? (
                <Chart used={count - pending} pending={pending} available={count} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Workloads</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}

function PodStatusChart({items}: {items: ApiItem<any, any>[] | null}) {
    const current = _.sumBy(items, getCurrentCount);
    const expected = _.sumBy(items, getExpectedCount);

    return (
        <div className='charts_item'>
            {items ? (
                <Chart used={current} pending={expected - current} available={expected} />
            ) : (
                <LoadingChart />
            )}
            <div className='charts_itemLabel'>Pods</div>
            <div className='charts_itemSubLabel'>Ready vs Requested</div>
        </div>
    );
}

function Status({item}: {item: ApiItem<any, any>}) {
    const current = getCurrentCount(item);
    const expected = getExpectedCount(item);
    const text = `${current} / ${expected}`;

    if (current === expected) return <span>{text}</span>;
    return <Working className='contentPanel_warn' text={text} />;
}

function getCurrentCount({status}: TODO) {
    return status.readyReplicas || status.numberReady || 0;
}

function getExpectedCount({spec, status}: TODO) {
    return spec.replicas || status.currentNumberScheduled || 0;
}

function filterControllers(filter: string, items: TODO[]) {
    const results = items
        .flat()
        .filter(x => !!x);

    // If there are no results yet but some of the workload types are still
    // loading, return "null" so we display the "loading" control
    if (!results.length && items.some(x => !x)) return null;

    return _(results)
        .flatten()
        .filter(x => test(filter, x.metadata.name))
        .value();
}
