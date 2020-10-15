import _ from 'lodash';
import React from 'react';
import Base from './base';
import Sorter, {SortInfo} from './sorter';
import LoadingEllipsis from './loadingEllipsis';
import {MetadataHeaders, MetadataColumns, TableBody} from './listViewHelpers';
import {unparseRam, unparseCpu} from '../utils/unitHelpers';
import {getPodResourcePercent, getPodUsage, getPodResourceValue, ResourceType} from '../utils/metricsHelpers';
import {Pod, TODO, Metrics} from '../utils/types';

type MetricsGroups = _.Dictionary<Metrics>;

type Props = {
    items?: Pod[];
    metrics?: MetricsGroups;
    sort?: SortInfo;
    filter?: string;
    skipNamespace?: boolean;
}

type State = {
}

type SortHandler = (pod: Pod) => number | undefined;

export default class PodsPanel extends Base<Props, State> {
    private sortByCpuUsage: SortHandler;

    private sortByCpuRequest: SortHandler;

    private sortByCpuLimit: SortHandler;

    private sortByRamUsage: SortHandler;

    private sortByRamRequest: SortHandler;

    private sortByRamLimit: SortHandler;

    constructor(props: Props) {
        super(props);

        const {metrics} = this.props;

        this.sortByCpuUsage = (x: Pod) => getPodUsage(x, metrics, 'cpu');
        this.sortByCpuRequest = (x: Pod) => sortBy(x, metrics, 'cpu', 'requests');
        this.sortByCpuLimit = (x: Pod) => sortBy(x, metrics, 'cpu', 'limits');

        this.sortByRamUsage = (x: Pod) => getPodUsage(x, metrics, 'memory');
        this.sortByRamRequest = (x: Pod) => sortBy(x, metrics, 'memory', 'requests');
        this.sortByRamLimit = (x: Pod) => sortBy(x, metrics, 'memory', 'limits');
    }

    render() {
        const {items, metrics, sort, filter, skipNamespace} = this.props;
        const col = 10 + Number(!skipNamespace);

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} includeNamespace={!skipNamespace} />
                            <th className='optional_medium'><Sorter field={getRestartCount} sort={sort}>Restarts</Sorter></th>
                            <th>
                                <Sorter field={this.sortByCpuUsage} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Actual</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuRequest} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Request</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuLimit} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Limit</div>
                                </Sorter>
                            </th>
                            <th>
                                <Sorter field={this.sortByRamUsage} sort={sort}>
                                    Ram
                                    <div className='smallText'>Actual</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamRequest} sort={sort}>
                                    Ram
                                    <div className='smallText'>Request</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamLimit} sort={sort}>
                                    Ram
                                    <div className='smallText'>Limit</div>
                                </Sorter>
                            </th>
                        </tr>
                    </thead>

                    <TableBody items={items} filter={filter} sort={sort} colSpan={col} row={x => (
                        <tr key={x.metadata.uid}>
                            <MetadataColumns
                                item={x}
                                resourceClass={getPhaseStyle(x.status.phase)}
                                includeNamespace={!skipNamespace}
                                href={`#!pod/${x.metadata.namespace}/${x.metadata.name}`}
                            />
                            <td className='optional_medium'>{getRestartCount(x)}</td>
                            {getChart(x, metrics, 'cpu')}
                            {getChart(x, metrics, 'memory')}
                        </tr>
                    )} />
                </table>
            </div>
        );
    }
}

function getPhaseStyle(phase: string) {
    switch (phase) {
        case 'Pending':
            return 'svg_warn';

        case 'Running':
            return undefined;

        case 'Failed':
        case 'Unknown':
            return 'svg_error';

        case 'Succeeded':
        case 'Completed':
        default:
            return 'svg_neutral';
    }
}

function sortBy(
    pod: Pod | undefined,
    metrics: MetricsGroups | undefined,
    resource: ResourceType,
    type: string,
) {
    const result = getPodResourcePercent(pod, metrics, resource, type);
    return result && Number.isFinite(result) ? result : -1;
}

function getRestartCount({status}: Pod) {
    return _.sumBy(status.containerStatuses, 'restartCount');
}

function getChart(
    pod: Pod | undefined,
    metrics: MetricsGroups | undefined,
    resource: ResourceType,
) {
    const actual = getPodUsage(pod, metrics, resource);

    return (
        <>
            {actual != null && getRawDisplay(pod, metrics, actual, resource)}
            {actual != null && getPercentDisplay(pod, metrics, actual, resource, 'requests')}
            {actual != null && getPercentDisplay(pod, metrics, actual, resource, 'limits')}
        </>
    );
}

function getRawDisplay(
    pod: Pod | undefined,
    metrics: MetricsGroups | undefined,
    actual: number | null,
    resource: ResourceType,
) {
    if (!pod || !metrics) return <td><LoadingEllipsis /></td>;

    const unparser = resource === 'cpu' ? unparseCpu : unparseRam;
    // @ts-ignore
    const actualResult = unparser(actual);

    return (
        <td>
            {actualResult.value}
            <span className='smallText'>{actualResult.unit}</span>
        </td>
    );
}

function getPercentDisplay(
    item: TODO,
    metrics: TODO,
    actual: number,
    resource: ResourceType,
    type: string,
) {
    if (!item || !metrics) return <td className='optional_xsmall'><LoadingEllipsis /></td>;

    const request = getPodResourceValue(item, resource, type);
    if (!request) return <td className='smallText optional_xsmall'>-</td>;

    const unparser = resource === 'cpu' ? unparseCpu : unparseRam;
    const result = unparser(request);
    const percent = request ? _.round(actual / request * 100, 1) : 0;
    const className = percent > 85 ? 'optional_xsmall contentPanel_warn' : 'optional_xsmall';

    return (
        <td className={className}>
            {percent}<span className='smallText'>%</span>
            <div className='smallText'>{result.value}{result.unit}</div>
        </td>
    );
}
